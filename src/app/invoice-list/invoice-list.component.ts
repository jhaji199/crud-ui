import { Component, OnInit } from '@angular/core';
import { EmployeeService } from '../employee.service';
import { Invoice } from '../invoice.model';
import { ActivatedRoute, Router } from '@angular/router';
@Component({
  selector: 'app-invoice-list',
  templateUrl: './invoice-list.component.html',
  styleUrls: ['./invoice-list.component.css']
})
export class InvoiceListComponent implements OnInit {
  invoices: Invoice[] = [];
  selectedInvoice: Invoice | null = null;

  constructor(private employeeService: EmployeeService,private router: Router,) {}

  ngOnInit(): void {
    this.getInvoices();    
  }

  // Fetch all invoices
  getInvoices(): void {    
    this.employeeService.getInvoices().subscribe(
      (response: Invoice[]) => {
        this.invoices = response;       
        console.log('Invoices:', this.invoices);
      },
      (error) => {
        console.error('Error fetching invoices:', error);
      }
    );
  }

  // View selected invoice details
  viewInvoiceDetails(invoiceId: number): void {
    this.employeeService.getInvoiceswithdetails(invoiceId).subscribe(
      (response: any) => {
        if (response) {
          this.selectedInvoice = response.invoice;
          console.log('Selected Invoice:', this.selectedInvoice);
  
          // Navigate to the form page
          this.router.navigate(['/invoice'], {
            queryParams: { invoiceId: invoiceId },
          });
        } else {
          console.error('No data found for the selected invoice.');
        }
      },
      (error) => {
        console.error('Error fetching invoice details:', error);
      }
    );
  }
  

   // Delete an invoice
   deleteInvoice(invoiceId: number): void {
    if (confirm('Are you sure you want to delete this invoice?')) {
      this.employeeService.deleteInvoice(invoiceId).subscribe(
        () => {
          this.getInvoices();
          alert('Invoice deleted successfully!');
        },
        (error) => {
          console.error('Error deleting invoice:', error);
          alert('Failed to delete the invoice.');
        }
      );
    }
  }
}