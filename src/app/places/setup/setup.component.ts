import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';


@Component({
  selector: 'app-setup',
  templateUrl: './setup.component.html',
  styleUrls: ['./setup.component.scss']
})
export class SetupComponent implements OnInit {

  formData: FormData = new FormData();
  setupComplete: boolean = false;

  setupForm = new FormGroup({
    proxyUserName: new FormControl('geonode_7Hbuw9KHL0-autoReplace-True', Validators.required),
    proxyPassword: new FormControl('fc96bf48-5382-4176-8e51-299191d4ff9d', Validators.required),
    proxyDNS: new FormControl('premium-residential.geonode.com', Validators.required),
    threads: new FormControl('10000', Validators.required),
  });

  constructor(private _http: HttpClient) { }
  
  isFormValid(): boolean {
    if (this.formData.has('file') && this.setupForm.valid) {
      return true;
    }
    return false;
  }
  
  submit(): void {
    let proxyUserName = this.setupForm.get('proxyUserName')!.value;
    let proxyPassword = this.setupForm.get('proxyPassword')!.value;
    let proxyDNS = this.setupForm.get('proxyDNS')!.value;
    let threads = this.setupForm.get('threads')!.value;
    
    this.setupComplete = true;

    let postBody = {
      user: proxyUserName,
      pass: proxyPassword,
      dns: proxyDNS,
      threads: threads
    };

    if (this.formData.has('data')) {
      this.formData.delete('data');
    }
    const postJson = JSON.stringify(postBody);
    this.formData.append('data', postJson);    
    if (this.formData.has('file')) {
      this._http.post('http://localhost:3000/setup', this.formData).subscribe((data) => {
        // this.setupForm.reset();
        console.log("Called Setup!");
      });
    }
  }

  // test(): void {
  //   this._http.post('http://localhost:3000/test', {concurrency: 10, workers: 3}).subscribe(data => {
  //     console.log(data);
  //   });
  // }

  onFileChange(event: any): void {
    if (event.target.files.length > 0) {
      console.log('this is called');
      const file = event.target.files[0];
      console.log(file);
      this.formData.append('file', file, file.name);
    }
  }

  kill(): void {
    this._http.get('http://localhost:3000/kill').subscribe((data) => {
      console.log(data);
    });
  }

  ngOnInit(): void {
  }

}
