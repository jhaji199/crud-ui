import { Component, OnInit } from '@angular/core';
import { EmployeeService } from '../employee.service';
import { Employee } from '../employee.model';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-employee-list',
  templateUrl: './employee-list.component.html',
  styleUrls: ['./employee-list.component.css']
})
export class EmployeeListComponent implements OnInit {

  dataSource: Employee[] = [];

  displayedColumns: string[] = ['employeeName', 'employeeContactNumber', 'countryName', 'stateName', 'employeeAddress', 'employeeDepartment', 'employeeGender', 'employeeSkills', 'edit', 'delete'];

  constructor(private employeeService: EmployeeService,
    private router: Router) {
    this.getEmployeeList();
  }

  ngOnInit(): void {
    
  }

  updateEmployee(employeeId: number): void {   
    debugger
    console.log(employeeId)
    this.router.navigate(["/employee", {employeeId: employeeId}]);
  }

  deleteEmployee(employeeId: number): void {
    console.log(employeeId);
    this.employeeService.deleteEmployee(employeeId).subscribe(
      {
        next: (res) => {
          console.log(res);
          this.getEmployeeList();
        },
        error: (err: HttpErrorResponse) => {
          console.log(err);
        }
      }
    );
  }

  getEmployeeList(): void {
    this.employeeService.getEmployees().subscribe(
      {
        next: (res: Employee[]) => {
          this.dataSource = res;
          console.log(res);
        },
        error: (err: HttpErrorResponse)=> {
          console.log(err);
        }
      }
    );
  }
}
