import { Component, OnInit } from '@angular/core';
import { Employee } from '../employee.model';
import { NgForm } from '@angular/forms';
import { EmployeeService } from '../employee.service';
import { HttpErrorResponse } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-employee',
  templateUrl: './employee.component.html',
  styleUrls: ['./employee.component.css']
})
export class EmployeeComponent implements OnInit {

  isCreateEmployee: boolean = true;
  employee: any;
  Skills: string[] = [];
  counties: { id: number, countryname: string }[]= []; 
  states: { id: number, statename: string }[] = [];

  constructor(private employeeService: EmployeeService,
    private router: Router,
    private route: ActivatedRoute) {

  }

  ngOnInit(): void {

    this.route.data.subscribe((data) => {
      // Handle when data['employee'] is an array
      if (Array.isArray(data['employee']) && data['employee'].length > 0) {
        this.employee = data['employee'][0]; // Use the first employee object from the array
      } else {
        this.employee = data['employee'] || {}; // Fallback to an empty object if not an array
      }
    });
    
    this.getCountries();
    if (this.employee && this.employee.employeeId > 0) {

        this.isCreateEmployee = false;
    
        if (this.employee.employeeSkills) {
        this.Skills = [];
        this.Skills = this.employee.employeeSkills.split(',');
      
      console.log(this.employee)
      console.log(this.employee.countryId)
      if (this.employee.countryId) {                
        this.getStates(this.employee.countryId);
      }
    } else {
      this.isCreateEmployee = true;
    }    
  }
}

  getCountries(): void {
    this.employeeService.getCountries().subscribe(
      (response: { id: number, countryname: string }[]) => {
        this.counties = response;  // Populate counties with country objects
        console.log(response);  
      },
      (error: HttpErrorResponse) => {
        console.log(error);
      }
    );
  }
  onCountryChange(event: any): void {
    const selectedCountryId = event.value;  // Get the selected country ID from the event
    console.log("Selected Country ID:", selectedCountryId);

    // Reset the states list before fetching new states
    this.states = [];
    
    if (selectedCountryId) {
      this.getStates(selectedCountryId);  // Fetch states for the selected country
    }
  }

  // Method to fetch states from the database based on the selected country
  getStates(countryId: number): void {
    this.employeeService.getStates(countryId).subscribe(
      (response: { id: number, statename: string }[]) => {
        this.states = response; // Populate states list based on selected country
        console.log(this.states);  // Log states for debugging
      },
      (error: HttpErrorResponse) => {
        console.log(error);
      }
    );
  }
 
  checkSkills(skill: string) {
    return this.employee.employeeSkills != null && this.employee.employeeSkills.includes(skill);
  }

  checkGender(gender: string) {
    return this.employee.employeeGender != null && this.employee.employeeGender == gender;
  }

  saveEmployee(employeeForm: NgForm): void {
    this.validateForm(employeeForm);

    // If the form is invalid, do not proceed
    if (!employeeForm.valid) {
      console.log('Form is invalid');
      return;
    }
    if (this.isCreateEmployee) {
      this.employeeService.saveEmployee(this.employee).subscribe(
        {
          next: (res: Employee) => {
            console.log(res);
            employeeForm.reset();
            this.employee.employeeGender = '';
            this.Skills = [];
            this.employee.employeeSkills = '';
            this.router.navigate(["/employee-list"]);
          },
          error: (err: HttpErrorResponse) => {
            console.log(err);
          }
        }
      );
    } else {
      this.employeeService.updateEmployee(this.employee, this.employee.employeeId).subscribe(
        {
          next: (res: Employee) => {
            this.router.navigate(["/employee-list"]);
          },
          error: (err: HttpErrorResponse) => {
            console.log(err);
          }
        }
      );
    }
  }

  selectGender(gender: string): void {
    this.employee.employeeGender = gender;
  }

  onSkillsChanges(event: any): void {
    console.log(event);
    if (event.checked) {
      this.Skills.push(event.source.value);
    } else {
      this.Skills.forEach(
        (item, index) => {
          if (item == event.source.value) {
            this.Skills.splice(index, 1);
          }
        }
      );
    }

    this.employee.employeeSkills = this.Skills.toString();
  }
  validateForm(employeeForm: NgForm): void {
    // Mark all controls in the form as "touched" to trigger validation errors
    Object.keys(employeeForm.controls).forEach(field => {
      const control = employeeForm.controls[field];
      control.markAsTouched({ onlySelf: true });
    });
  }
}
