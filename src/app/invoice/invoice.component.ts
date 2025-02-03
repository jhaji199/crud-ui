import { Component, OnInit } from '@angular/core';
import { EmployeeService } from '../employee.service';
import { HttpErrorResponse } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { Invoice, InvoiceDetails } from '../invoice.model';
import { NgForm } from '@angular/forms';
import { ChangeDetectorRef } from '@angular/core';
import * as bootstrap from 'bootstrap';


@Component({
  selector: 'app-invoice',
  templateUrl: './invoice.component.html',
  styleUrls: ['./invoice.component.css']
})
export class InvoiceComponent implements OnInit {

  invoice: Invoice = {
    invoiceId: 0,
    invoiceNo: '',
    customerId: 0,
    customerName: '',
    deliveryAddress: '',
    remarks: '',
    total: 0,
    tax: 0,
    netTotal: 0,
    invoiceDate: '',
    AttachmentPath: '',
    AttachmentName: '',
    details: []
  };
  showReport: boolean = false;
  MyFile: any;
  fileupload: any;
  selectedProductId: number | null = null;
  isCreateEmployee: boolean = true;
  nextInvoiceNumber: string = '';
  selectedDescription: string = '';
  quantity: number = 0;  // Default value
  price: number = 0;     // Default value
  total: number = 0;     // Default value
  summaryTotal: number = 0; // Summary Total
  taxPercentage: number = 0; // Tax Percentage Input
  taxAmount: number = 0; // Tax Amount
  netTotal: number = 0; // Net Total
  productCode: string = '';
  productid: number = 0;
  products: any[] = [];
  selectedFile: File | null = null;
  attachmentPreview: string | null = null;
  isImage: boolean = false;
  showPreview: boolean = false;
  editingIndex: number | null = null;
  rateHistory: any[] = [];
  Customer: { employeeId: number, employeeName: string, employeeAddress: string }[] = [];
  Address: { employeeAddress: string }[] = [];
  Item: { id: number, itemcode: string, itemname: string }[] = [];

  constructor(
    private employeeService: EmployeeService,
    private router: Router,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      const invoiceId = params['invoiceId'];
      if (invoiceId) {
        this.loadInvoice(invoiceId);
        this.isCreateEmployee = false;
      }
      else {
        this.isCreateEmployee = true;
      }
    });
    this.getNextInvoiceNo();
    this.getCustomer();
    this.getItem();  // Fetch items from the service
  }

  // Fetch customer data
  getCustomer(): void {
    this.employeeService.getCustomer().subscribe(
      (response: { employeeId: number, employeeName: string, employeeAddress: string }[]) => {
        this.Customer = response;
        console.log('Customer Data:', response);
      },
      (error: HttpErrorResponse) => {
        console.error('Error fetching customer data:', error);
      }
    );
  }

  onCustomerChange(event: any): void {
    const selectedCustomerId = event.target.value;
    const selectedCustomer = this.Customer.find(customer => customer.employeeId === +selectedCustomerId);
    if (selectedCustomer) {
      this.invoice.customerName = selectedCustomer.employeeName; // Set customer name
    }
    this.Address = [];
    if (selectedCustomerId) {
      this.getCustomerAddress(selectedCustomerId);
      console.log('Selected Customer:', selectedCustomerId);
    }
  }

  getNextInvoiceNo(): void {
    this.employeeService.getNextInvoiceNumber().subscribe({
      next: (res: string) => {
        this.nextInvoiceNumber = res;
        this.invoice.invoiceNo = res;
        console.log('Next Invoice Number:', this.nextInvoiceNumber);
      },
      error: (err) => {
        this.handleError(err);
      }
    });
  }

  handleError(err: any): void {
    console.error('Error:', err);
    if (err instanceof HttpErrorResponse) {
      console.error('Error status:', err.status);
      console.error('Error details:', err.error);
    }
  }

  getCustomerAddress(customerId: number): void {
    this.employeeService.getCustomerAddress(customerId).subscribe({
      next: (res: string) => {
        this.invoice.deliveryAddress = res;
        console.log('Customer Address:', this.invoice.deliveryAddress);
      },
      error: (err) => {
        this.handleError(err);
      }
    });
  }

  // Fetch Item data
  getItem(): void {
    this.employeeService.getItem().subscribe(
      (response: { id: number, itemcode: string, itemname: string }[]) => {
        this.Item = response;
        console.log('Item Data:', response);
      },
      (error: HttpErrorResponse) => {
        console.error('Error fetching Item data:', error);
      }
    );
  }

  onItemChange(event: any): void {
    const selectedId = +event.target.value;
    const selectedItem = this.Item.find(item => item.id === +selectedId);
    if (selectedItem) {
      // Populate form fields with selected product details
      this.productid = selectedItem.id;
      this.productCode = selectedItem.itemcode;
      this.selectedDescription = selectedItem.itemname;
      console.log('Selected Product:', {
        id: this.productid,
        code: this.productCode,
        description: this.selectedDescription,
      });
    }

    // Clear selected product after adding to details
    // this.selectedProductId = null;    
  }

  calculateTotal(): void {
    this.total = (this.quantity || 0) * (this.price || 0);
  }

  // Add or Update Product
  // Add or Update Product (Only when the user confirms)
  addProduct(): void {
    if (this.productCode === '' || this.selectedDescription === '' || this.quantity === 0 || this.price === 0) {
      alert('Please fill in all fields: Product Code, Description, Quantity, and Price.');
      return; // Prevent adding the product if validation fails
    }

    if (this.editingIndex !== null) {
      // Update the existing product in the products list
      this.products[this.editingIndex] = {
        productId: this.productid,
        productCode: this.productCode,
        description: this.selectedDescription,
        quantity: this.quantity,
        price: this.price,
        total: this.total,
      };
      this.editingIndex = null; // Reset editing index      
    } else {
      // Add a new product to the list
      const newProduct = {
        productId: this.productid,
        productCode: this.productCode,
        description: this.selectedDescription,
        quantity: this.quantity,
        price: this.price,
        total: this.total,
      };
      this.products.push(newProduct);
      console.log(newProduct);
    }

    // Recalculate the summary total and reset the form fields
    this.updateSummaryTotal();
    this.resetFormFields();

    this.selectedProductId = null;
  }

  // Remove Product
  removeProduct(index: number): void {
    this.products.splice(index, 1);
    this.updateSummaryTotal(); // Recalculate the summary total after removal
  }

  // Update Summary Total
  updateSummaryTotal(): void {
    // Calculate the total sum of products
    this.invoice.total = this.products.reduce((sum, product) => sum + product.total, 0);

    // Recalculate Net Total based on the user-provided tax
    this.calculateNetTotal();

    console.log('Summary Total:', this.invoice.total);
  }

  calculateNetTotal(): void {
    // Calculate the tax amount based on user input
    this.taxAmount = (this.invoice.total * (this.invoice.tax || 0)) / 100;

    // Calculate the net total
    this.invoice.netTotal = this.invoice.total + this.taxAmount;

    console.log('Tax Amount:', this.taxAmount);
    console.log('Net Total:', this.invoice.netTotal);
  }

  onTaxChange(): void {
    this.calculateNetTotal(); // Recalculate only the net total and tax
  }

  // Reset Form Fields
  resetFormFields(): void {
    this.productid = 0;
    this.productCode = '';
    this.selectedDescription = '';
    this.quantity = 0;
    this.price = 0;
    this.total = 0;
  }

  // Edit Product (Only populate form fields without saving)
  editProduct(index: number): void {
    const product = this.products[index];
    this.editingIndex = index; // Set editing mode
    this.productid = product.productId;
    this.selectedProductId = product.productId;
    this.productCode = product.productCode;
    this.selectedDescription = product.description;
    this.quantity = product.quantity;
    this.price = product.price;
    this.total = product.total;
    // No product is saved here, only populated form fields
    // Trigger change detection

  }
  saveInvoice(InvoiceForm: NgForm): void {
    this.validateForm(InvoiceForm);
    debugger
    // Validate fields
    if (!this.invoice.invoiceNo || !this.invoice.customerId) {
      alert('Please provide Invoice Number and select a Customer.');
      return;
    }

    if (!this.products || this.products.length === 0) {
      alert('Please add product details to the invoice.');
      return;
    }

    // Prepare invoice details
    this.invoice.details = this.products.map(product => ({
      productId: product.productId,
      productCode: product.productCode,
      productName: product.description,
      qty: product.quantity,
      salesPrice: product.price,
      total: product.total,
    }));

    // Create FormData
    const formData = new FormData();

    // Add Invoice fields
    formData.append("Invoice[invoiceId]", this.invoice.invoiceId.toString());
    formData.append("Invoice[invoiceNo]", this.invoice.invoiceNo);
    formData.append("Invoice[customerId]", this.invoice.customerId.toString());
    formData.append("Invoice[customerName]", this.invoice.customerName);
    formData.append("Invoice[deliveryAddress]", this.invoice.deliveryAddress);
    formData.append("Invoice[remarks]", this.invoice.remarks || '');
    formData.append("Invoice[total]", this.invoice.total.toString());
    formData.append("Invoice[tax]", this.invoice.tax.toString());
    formData.append("Invoice[netTotal]", this.invoice.netTotal.toString());
    formData.append("Invoice[invoiceDate]", this.invoice.invoiceDate);
    formData.append("Invoice[AttachmentPath]", '');
    formData.append("Invoice[AttachmentName]", '');
    // Add file (if selected)
    if (this.selectedFile) {
      formData.append("MyFile", this.selectedFile, this.selectedFile.name);
    }

    // Add InvoiceDetails as a JSON string
    if (Array.isArray(this.invoice.details)) {
      formData.append("InvoiceDetails", JSON.stringify(this.invoice.details));
    } else {
      console.error('Error: Invoice details must be an array');
      alert('Invoice details must be an array');
      return;
    }
    formData.forEach((value, key) => {
      console.log(`${key}:`, value);
    });
    if (this.isCreateEmployee) {
      // Create a new invoice
      // Call service
      this.employeeService.saveInvoice(formData).subscribe({
        next: (response) => {
          console.log('Invoice saved successfully:', response);
          alert('Invoice saved successfully!');
          this.router.navigate(['/invoice-list']);
        },
        error: (err) => {
          console.error('Error saving invoice:', err);
          alert('An error occurred while saving the invoice.');
        },
      });
    } else {
      // // Update an existing invoice      
      // Call API
      this.employeeService.UpdateInvoicewithDitails(formData).subscribe({
        next: (response) => {
          console.log('Invoice updated successfully:', response);
          alert('Invoice updated successfully!');
          this.router.navigate(['/invoice-list']);
        },
        error: (err) => {
          console.error('Error updating invoice:', err);
          alert('An error occurred while updating the invoice.');
        }
      });

    }
  }

  resetInvoice(): void {
    this.invoice = {
      invoiceId: 0,
      invoiceNo: '',
      customerId: 0,
      customerName: '',
      deliveryAddress: '',
      remarks: '',
      total: 0,
      tax: 0,
      netTotal: 0,
      invoiceDate: '',
      AttachmentPath: '',
      AttachmentName: '',
      details: []
    };

    this.products = [];
    this.taxAmount = 0;
    this.summaryTotal = 0;
    this.netTotal = 0;
    this.productCode = '';
    this.selectedDescription = '';
    this.quantity = 0;
    this.price = 0;
    this.total = 0;
  }
  loadInvoice(invoiceId: number): void {
    this.employeeService.getInvoiceswithdetails(invoiceId).subscribe(
      (response: any) => {
        console.log('Invoice Response:', response);  // Check entire response
        this.invoice = response.invoice;
        this.invoice.AttachmentName = response.invoice.attachmentName;
        console.log(response.invoice.attachmentName);
        // Format the invoiceDate to "yyyy-MM-dd"
        if (this.invoice.invoiceDate) {
          this.invoice.invoiceDate = this.formatDate(this.invoice.invoiceDate);
        }
        console.log('Invoice Details:', this.invoice.details);  // Check invoice details specifically
        this.showReport = true;
        // Ensure details are correctly assigned
        this.products = this.invoice.details;

        // Log each product to verify fields
        this.products.forEach(product => {
          console.log('Product:', product);
          console.log('Description:', product.description);
          console.log('Quantity:', product.qty);
          console.log('Price:', product.price);
        });
      },
      (error) => {
        console.error('Error fetching invoice details:', error);
      }
    );
  }
  validateForm(InvoiceForm: NgForm): void {
    // Mark all controls in the form as "touched" to trigger validation errors
    Object.keys(InvoiceForm.controls).forEach(field => {
      const control = InvoiceForm.controls[field];
      control.markAsTouched({ onlySelf: true });
    });
  }
  // Triggered when a file is selected
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;

    if (input.files && input.files[0]) {
      this.selectedFile = input.files[0];
      this.fileupload = this.selectedFile;
      //this.invoice.AttachmentName = this.selectedFile;
      // Check if the file is an image
      this.isImage = this.selectedFile.type.startsWith('image/');

      // Load the file preview
      const fileReader = new FileReader();
      fileReader.onload = () => {
        this.attachmentPreview = fileReader.result as string;
      };
      fileReader.readAsDataURL(this.selectedFile);
    }
  }

  // Triggered when the "Preview Attachment" button is clicked
  previewAttachment(): void {
    if (this.attachmentPreview) {
      this.showPreview = true;
    }
  }

  // Close the preview modal
  closePreview(): void {
    this.showPreview = false;
  }

  formatDate(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = ('0' + (date.getMonth() + 1)).slice(-2);
    const day = ('0' + date.getDate()).slice(-2);
    return `${year}-${month}-${day}`;
  }
  // Method to open the Rate History modal and fetch data
  openRateHistoryModal(): void {
    // Fetch rate history from the API
    this.employeeService.getRateHistory(this.productid).subscribe((data: any) => {
      this.rateHistory = data;  // Assign the data to the rateHistory array
      // Show the modal after data is fetched
      const modal = new bootstrap.Modal(document.getElementById('rateHistoryModal')!);
      modal.show();
    });
  }
  printReport(): void {
    const printContents = document.getElementById('printableReport')?.innerHTML;
    if (printContents) {
      const newWindow = window.open('', '_blank');
      if (newWindow) {
        newWindow.document.write(`
          <html>
            <head>
              <title>Invoice Report</title>
              <style>
                @media print {
                  body {
                    font-family: Arial, sans-serif;
                    margin: 20px;
                  }
                  table {
                    width: 100%;
                    border-collapse: collapse;
                  }
                  th, td {
                    border: 1px solid #ddd;
                    padding: 8px;
                  }
                  th {
                    background-color: #f2f2f2;
                  }
                     h1 {
                  text-align: center;
                  font-weight: bold;
                  font-size: 24px;
                }
                }
              </style>
            </head>
            <body>
              <h1>Invoice Report</h1>
              <hr>
            ${printContents}
            </body>
          </html>
        `);
        newWindow.document.close();
        newWindow.focus();
        newWindow.print();
        newWindow.close();
      }
    }
  }
}  