export interface Invoice {
    invoiceId: number;             // Unique identifier for the invoice
    invoiceNo: string;             // Invoice number
    customerId: number;            // ID of the customer
    customerName: string;          // Name of the customer
    deliveryAddress: string;       // Delivery address for the invoice
    remarks?: string;              // Optional remarks about the invoice
    total: number;                 // Total amount for the invoice
    tax: number;                   // Tax amount
    netTotal: number;              // Net total after tax
    invoiceDate: string; 
    AttachmentPath:any;
    AttachmentName:any;           
    details: InvoiceDetails[];  
      // Array of invoice detail items
  }
  export interface InvoiceDetails {
    productId : number;
    productCode: string;           // Code of the product or service
    productName: string;           // Name or description of the product/service
    qty: number;                   // Quantity of the product/service
    salesPrice: number;            // Price per unit
    total: number;                 // Total cost for this line item (qty * salesPrice)
  }
  
  