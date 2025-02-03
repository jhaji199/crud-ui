import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HeaderComponent } from './header/header.component';
import { HomeComponent } from './home/home.component';
import { EmployeeComponent } from './employee/employee.component';
import { EmployeeListComponent } from './employee-list/employee-list.component';
import { EmployeeResolver } from './employee-resolver';
import { InvoiceListComponent } from './invoice-list/invoice-list.component';
import { InvoiceComponent } from './invoice/invoice.component';

const routes: Routes = [
  {path: 'header', component: HeaderComponent},
  {path: 'employee', component: EmployeeComponent, resolve: {employee: EmployeeResolver} },
  {path: 'employee-list', component: EmployeeListComponent},
  {path: 'invoice', component: InvoiceComponent},
  {path: 'invoice-list', component: InvoiceListComponent},
  {path: '', component: HomeComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
