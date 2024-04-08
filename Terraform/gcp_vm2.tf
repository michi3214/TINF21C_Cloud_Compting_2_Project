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
    ssh-keys = "r_grote72:ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABAQClbmK2JuJ+9nGkrztTc5t3BnpXue/Mpmsu74Vp7irRl4SUhCbeItysdahnagy4dXrMfZbeFfADkLEQryRh7xsklkQ495NBqhPrcoTVU+aTKzJAm4syc6b3xEC368ci+RLBPUgoTThoeSSA5DaWZTvhswoQw7nANflSNVHZGaM3pyUAdtv7eeQHTfpBjD8v+XRBnVkUPXqmzHd8ogRxr3FtKQJaGpa0Bc/842rIGdv/60UYURF+4IG6MktpE/YTLS7vp5b09IaVprurE3EQpTxhb/a5JrbDTNbEpgUrxof36HKoqFG0E90tRaWvO2qcwgCgzu9yFVtzlX/vszi3C6dr rsa-key-20240219"
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

  settings {
    # Second-generation instance tiers are based on the machine
    # type. See argument reference below.
    tier = "db-f1-micro"
  }
}

output "sql_ip_addr" {
  value       = google_sql_database_instance.main.private_ip_address # <RESOURCE TYPE>.<NAME>.<ATTRIBUTE>
  description = "The private IP address of the sql server instance."
}

output "webserver_ip_addr" {
  value       = google_compute_instance.gcp-vm2.network_interface.0.network_ip # <RESOURCE TYPE>.<NAME>.<ATTRIBUTE>
  description = "The private IP address of the webserver instance."
}