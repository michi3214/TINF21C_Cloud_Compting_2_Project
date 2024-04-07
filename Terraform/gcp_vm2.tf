resource "google_project" "my_project" {
  name       = "Cloud-Computing-2"
  project_id = "ccii-000001"
}

provider "google" {
  project = "ccii-000001"
  region  = "europe-west1"
  zone    = "europe-west1-b"
}

resource "google_compute_instance" "vm_instance" {
  name         = "webserver-instance"
  machine_type = "e2-micro"

  boot_disk {
    auto_delete = true
    device_name = "gcp-vm2"
    initialize_params {
      image = "debian-cloud/debian-11"
    }
  }
  metadata = {
    ssh-keys = "r_grote72:ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABAQClbmK2JuJ+9nGkrztTc5t3BnpXue/Mpmsu74Vp7irRl4SUhCbeItysdahnagy4dXrMfZbeFfADkLEQryRh7xsklkQ495NBqhPrcoTVU+aTKzJAm4syc6b3xEC368ci+RLBPUgoTThoeSSA5DaWZTvhswoQw7nANflSNVHZGaM3pyUAdtv7eeQHTfpBjD8v+XRBnVkUPXqmzHd8ogRxr3FtKQJaGpa0Bc/842rIGdv/60UYURF+4IG6MktpE/YTLS7vp5b09IaVprurE3EQpTxhb/a5JrbDTNbEpgUrxof36HKoqFG0E90tRaWvO2qcwgCgzu9yFVtzlX/vszi3C6dr rsa-key-20240219"
  }

  network_interface {
   access_config {
      network_tier = "PREMIUM"
    }

    queue_count = 0
    stack_type  = "IPV4_ONLY"
    subnetwork  = "projects/ccii-000001/regions/us-central1/subnetworks/default"
  }



  service_account {
      email  = "968115168757-compute@developer.gserviceaccount.com"
      scopes = ["https://www.googleapis.com/auth/cloud-platform"]
  }
  tags = ["http-server", "https-server"]
  zone = "us-central1-a"
}