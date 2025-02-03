import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Employee } from './employee.model';
import { map, Observable } from 'rxjs';
import { Invoice } from './invoice.model';

@Injectable({
  providedIn: 'root'
})
export class EmployeeService {

  constructor(private httpClient: HttpClient) { }

  api = "https://localhost:7002"

  getCountries(): Observable<any[]> {
    return this.httpClient.get<any[]>(`${this.api}/api/State_Countries/countries`);
  }

  getStates(countryId: number): Observable<any[]> {
    return this.httpClient.get<any[]>(`${this.api}/api/State_Countries/states/${countryId}`); 
  }

  public saveEmployee(employee: Employee): Observable<Employee> {
    return this.httpClient.post<Employee>(`${this.api}/api/Employee/save/employee`, employee);
  }
  public updateEmployee(employee: Employee,employeeId: number) {
    return this.httpClient.put<Employee>(`${this.api}/api/Employee/update/employee/${employeeId}`, employee);
  }
  public getEmployees(): Observable<Employee[]> {
    return this.httpClient.get<Employee[]>(`${this.api}/api/Employee/get/employee`);
}

public deleteEmployee(employeeId: number) {
  return this.httpClient.delete(`${this.api}/api/Employee/delete/employee/${employeeId}`);
}
public getEmployee(employeeId: number) {
  return this.httpClient.get<Employee>(`${this.api}/api/Employee/get/employee/${employeeId}`);
}
getCustomer(): Observable<any[]> {
  return this.httpClient.get<any[]>(`${this.api}/api/Employee/employee/customer`);
}
getNextInvoiceNumber(): Observable<string> {
  // Do not specify <string> because you're treating the response as plain text
  return this.httpClient.get(`${this.api}/api/Invoice/getNextInvoiceNumber`, { responseType: 'text' });
}
getCustomerAddress(customerId: number): Observable<string> {
  return this.httpClient.get<{ employeeId: number, employeeAddress: string }[]>(`${this.api}/api/Employee/getCustomerAddress/${customerId}`).pipe(
    map((response: { employeeId: number, employeeAddress: string }[]) => {
      // Extract the first customer (since response is an array)
      const selectedCustomer = response[0]; // Assuming there is always at least one customer
      return selectedCustomer ? selectedCustomer.employeeAddress : '';  // Return address or empty string
    })
  );
}
getItem(): Observable<any[]> {
  return this.httpClient.get<any[]>(`${this.api}/api/Item/item`);
}
// saveInvoice(invoice: { Invoice: Invoice, InvoiceDetails: any[] }): Observable<any> {
//   return this.httpClient.post<any>(`${this.api}/api/Customers/Invoice`, invoice);
// }
saveInvoice(data:any) {
  return this.httpClient.post<any>(`${this.api}/api/Invoice/Invoice`, data);
}

// Fetch all invoices
getInvoiceswithdetails(invoiceId: number): Observable<any> {
  return this.httpClient.get<any>(`${this.api}/api/Invoice/getInvoiceswithdetails/${invoiceId}`).pipe(
    map((response: any[]) => {
      return response.length > 0 ? response[0] : null; // Extract the first object if it's an array
    })
  );
}

// Delete an invoice by ID
deleteInvoice(invoiceId: number): Observable<void> {
  return this.httpClient.delete<void>(`${this.api}/api/Invoice/deleteinvoices/${invoiceId}`);
}
getInvoices(): Observable<Invoice[]> {
  return this.httpClient.get<Invoice[]>(`${this.api}/api/Invoice/invoices`);
}
UpdateInvoicewithDitails(data:FormData) {
  return this.httpClient.post<any>(`${this.api}/api/Invoice/UpdateInvoicewithDitails`, data);
}
getRateHistory(productid: number): Observable<any> {
  return this.httpClient.get<any>(`${this.api}/api/Item/item/RateHistory/${productid}`);
}

}
