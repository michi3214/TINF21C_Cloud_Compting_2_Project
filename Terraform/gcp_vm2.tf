variable "project" {
  type = string
  default = "effective-aria-415514"
}

terraform {
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 4.0"
    }
  }
}

provider "google" {
  project = var.project
  region  = "europe-west1"
  zone    = "europe-west1-b"
}

resource "google_compute_instance" "gcp-vm2" {
  boot_disk {
    auto_delete = true
    device_name = "gcp-vm2"

    initialize_params {
      image = "projects/debian-cloud/global/images/debian-12-bookworm-v20240213"
      size  = 10
      type  = "pd-balanced"
    }
    mode = "READ_WRITE"
  }

  can_ip_forward      = false
  deletion_protection = false
  enable_display      = false

  labels = {
    goog-ec-src = "vm_add-tf"
  }

  machine_type = "e2-micro"

  metadata = {
    ssh-keys = "r_grote72:ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABgQCndZzbrS3iAcFlrITaP8nVURwH7QwkWA3Cx/d+gzFNI7OiLe8u+EDR4L183Ltiyj1L65RssMOUqB86AaLC8Ts2jg8iGvna6tPpKVheJIusRFUiAk1ZKadfqH0M6jtgfX6YQYixlx3DjYmjDcf7ZJ8sQz7XZVHrdIfKBEY3sbQCA4AA3uLCeNxisuPjcIoMYuXquwLoXImnHyuvpc8UoGgHlz8WmE2gv23Kj2LNgLFNbOlBNATD1teoLwNP6X5iqirHZbVa2KApxUW9rjBPXljjk0dt7GSNqqoMiDgdlujY6ygoFBujRWYRYUc+aa+7qZQ7uh6c4It3UbXYU8EgYvIZKEPptdjjfiNAQeELpAzfk2u/UyO6tHRNwLe7thNxZwLA6RRHfFEfZcz4l+zyRjtifxdO6v7EN52aCeYHNGVO5MWPgzzSVu5PaDmLnjHr6kHXb96pbtxVNpuUFlz2gJOLEK0HRserGfoj7dfA2gi6XQcqyiq6FBtmnUSk6Mr1SEM="
                          
  }

  name = "gcp-vm2"

  network_interface {
    access_config {
      network_tier = "PREMIUM"
    }

    queue_count = 0
    stack_type  = "IPV4_ONLY"
    subnetwork  = "projects/${var.project}/regions/us-central1/subnetworks/default"
  }

  scheduling {
    automatic_restart   = true
    on_host_maintenance = "MIGRATE"
    preemptible         = false
    provisioning_model  = "STANDARD"
  }

  service_account {
    email  = "968115168757-compute@developer.gserviceaccount.com"
    scopes = ["https://www.googleapis.com/auth/cloud-platform"]
  }

  shielded_instance_config {
    enable_integrity_monitoring = true
    enable_secure_boot          = false
    enable_vtpm                 = true
  }

  tags = ["http-server", "https-server"]
  zone = "us-central1-a"
}

resource "google_sql_database_instance" "main" {
  name             = "main-instance"
  database_version = "POSTGRES_15"
  region           = "us-central1"
  deletion_protection=false
  settings {
    # Second-generation instance tiers are based on the machine
    # type. See argument reference below.
    tier = "db-f1-micro"
    ip_configuration {
      authorized_networks {
       value =  google_compute_instance.gcp-vm2.network_interface.0.network_ip
      }
    }
    
      
  }
}

resource "google_sql_user" "users" {
  name     = "webserver-cloud-computing"
  instance = google_sql_database_instance.main.name
  password = "postgresPasswordCloudComputing"
}

output "sql_ip_addr" {
  value       = google_sql_database_instance.main.public_ip_address # <RESOURCE TYPE>.<NAME>.<ATTRIBUTE>
  description = "The public IP address of the sql server instance."
}

output "webserver_ip_addr" {
  value       = google_compute_instance.gcp-vm2.network_interface.0.access_config.0.nat_ip # <RESOURCE TYPE>.<NAME>.<ATTRIBUTE>
  description = "The public IP address of the webserver instance."
}

output "webserver_ip_addr" {
  value       = google_compute_instance.gcp-vm2.network_interface.0.network_ip # <RESOURCE TYPE>.<NAME>.<ATTRIBUTE>
  description = "The privat IP address of the webserver instance."
}