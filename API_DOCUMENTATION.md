# API Documentation

## Base URL
```
http://localhost:5000/api
```

## Response Format

All API responses follow this format:

**Success Response:**
```json
{
  "data": { ... },
  "status": 200
}
```

**Error Response:**
```json
{
  "error": "Error message",
  "status": 400/404/500
}
```

---

## Machine Endpoints

### Get All Machines
```http
GET /machines
```

**Response:**
```json
[
  {
    "machine_id": 1,
    "machine_name": "CNC Mill 1",
    "machine_type": "Milling",
    "hourly_rate": "75.00",
    "is_active": true,
    "created_at": "2024-01-01T00:00:00.000Z",
    "updated_at": "2024-01-01T00:00:00.000Z"
  }
]
```

### Get Machine by ID
```http
GET /machines/:id
```

### Create Machine
```http
POST /machines
```

**Request Body:**
```json
{
  "machine_name": "CNC Mill 2",
  "machine_type": "Milling",
  "hourly_rate": 80.00
}
```

### Update Machine
```http
PUT /machines/:id
```

**Request Body:**
```json
{
  "machine_name": "CNC Mill 2",
  "machine_type": "Milling",
  "hourly_rate": 85.00
}
```

### Disable Machine
```http
PATCH /machines/:id/disable
```

### Enable Machine
```http
PATCH /machines/:id/enable
```

---

## Customer Endpoints

### Get All Customers
```http
GET /customers
```

**Response:**
```json
[
  {
    "customer_id": 1,
    "company_name": "ABC Manufacturing Ltd",
    "address": "123 Industrial Ave, City",
    "contact_person_name": "John Smith",
    "email": "john@abcmfg.com",
    "phone": "+1-555-0100",
    "vat_number": "VAT123456",
    "is_active": true,
    "created_at": "2024-01-01T00:00:00.000Z",
    "updated_at": "2024-01-01T00:00:00.000Z"
  }
]
```

### Get Customer by ID
```http
GET /customers/:id
```

### Create Customer
```http
POST /customers
```

**Request Body:**
```json
{
  "company_name": "New Company Ltd",
  "address": "456 Business Park",
  "contact_person_name": "Jane Doe",
  "email": "jane@newcompany.com",
  "phone": "+1-555-0200",
  "vat_number": "VAT789012"
}
```

### Update Customer
```http
PUT /customers/:id
```

### Disable Customer
```http
PATCH /customers/:id/disable
```

### Enable Customer
```http
PATCH /customers/:id/enable
```

---

## Auxiliary Cost Endpoints

### Get All Auxiliary Costs
```http
GET /auxiliary-costs
```

**Response:**
```json
[
  {
    "aux_type_id": 1,
    "aux_type": "Setup Cost",
    "description": "Machine setup and preparation",
    "default_cost": "50.00",
    "is_active": true,
    "created_at": "2024-01-01T00:00:00.000Z",
    "updated_at": "2024-01-01T00:00:00.000Z"
  }
]
```

### Get Auxiliary Cost by ID
```http
GET /auxiliary-costs/:id
```

### Create Auxiliary Cost
```http
POST /auxiliary-costs
```

**Request Body:**
```json
{
  "aux_type": "Special Tooling",
  "description": "Custom tooling required",
  "default_cost": 150.00
}
```

### Update Auxiliary Cost
```http
PUT /auxiliary-costs/:id
```

### Disable Auxiliary Cost
```http
PATCH /auxiliary-costs/:id/disable
```

### Enable Auxiliary Cost
```http
PATCH /auxiliary-costs/:id/enable
```

---

## Quotation Endpoints

### Get All Quotations
```http
GET /quotations
```

**Response:**
```json
[
  {
    "quotation_id": 1,
    "quote_number": "QT00000001",
    "customer_id": 1,
    "company_name": "ABC Manufacturing Ltd",
    "quotation_date": "2024-01-15",
    "lead_time": "4-6 weeks",
    "payment_terms": "Net 30",
    "currency": "USD",
    "shipment_type": "Air Freight",
    "total_parts_cost": "1500.00",
    "total_fixed_cost": "0.00",
    "subtotal": "1500.00",
    "discount_percent": "5.00",
    "discount_amount": "75.00",
    "margin_percent": "15.00",
    "margin_amount": "213.75",
    "vat_percent": "10.00",
    "vat_amount": "163.88",
    "total_quote_value": "1802.63",
    "quotation_status": "Draft",
    "created_at": "2024-01-15T00:00:00.000Z",
    "updated_at": "2024-01-15T00:00:00.000Z"
  }
]
```

### Get Quotation by ID (Full Details)
```http
GET /quotations/:id
```

**Response:**
```json
{
  "quotation_id": 1,
  "quote_number": "QT00000001",
  "customer_id": 1,
  "company_name": "ABC Manufacturing Ltd",
  "contact_person_name": "John Smith",
  "email": "john@abcmfg.com",
  "phone": "+1-555-0100",
  "address": "123 Industrial Ave, City",
  "quotation_date": "2024-01-15",
  "lead_time": "4-6 weeks",
  "payment_terms": "Net 30",
  "currency": "USD",
  "shipment_type": "Air Freight",
  "total_parts_cost": "1500.00",
  "subtotal": "1500.00",
  "discount_percent": "5.00",
  "discount_amount": "75.00",
  "margin_percent": "15.00",
  "margin_amount": "213.75",
  "vat_percent": "10.00",
  "vat_amount": "163.88",
  "total_quote_value": "1802.63",
  "quotation_status": "Draft",
  "parts": [
    {
      "part_id": 1,
      "part_number": "PART-001",
      "part_description": "CNC Machined Component",
      "unit_material_cost": "50.00",
      "unit_operations_cost": "150.00",
      "unit_auxiliary_cost": "50.00",
      "quantity": 10,
      "part_subtotal": "2500.00",
      "operations": [
        {
          "operation_id": 1,
          "machine_id": 1,
          "machine_name": "CNC Mill 1",
          "machine_type": "Milling",
          "hourly_rate": "75.00",
          "operation_time_hours": "2.00",
          "operation_cost": "150.00"
        }
      ],
      "auxiliary_costs": [
        {
          "part_aux_id": 1,
          "aux_type_id": 1,
          "aux_type": "Setup Cost",
          "description": "Machine setup and preparation",
          "cost": "50.00"
        }
      ]
    }
  ]
}
```

### Create Quotation
```http
POST /quotations
```

**Request Body:**
```json
{
  "customer_id": 1,
  "quotation_date": "2024-01-15",
  "lead_time": "4-6 weeks",
  "payment_terms": "Net 30",
  "currency": "USD",
  "shipment_type": "Air Freight",
  "discount_percent": 5,
  "margin_percent": 15,
  "vat_percent": 10,
  "parts": [
    {
      "part_number": "PART-001",
      "part_description": "CNC Machined Component",
      "unit_material_cost": 50.00,
      "quantity": 10,
      "operations": [
        {
          "machine_id": 1,
          "operation_time_hours": 2.0
        }
      ],
      "auxiliary_costs": [
        {
          "aux_type_id": 1,
          "cost": 50.00
        }
      ]
    }
  ]
}
```

**Response:**
Returns the complete quotation with all calculated values (same as GET by ID response).

### Update Quotation
```http
PUT /quotations/:id
```

**Request Body:**
```json
{
  "customer_id": 1,
  "quotation_date": "2024-01-15",
  "lead_time": "4-6 weeks",
  "payment_terms": "Net 45",
  "currency": "USD",
  "shipment_type": "Sea Freight",
  "discount_percent": 10,
  "margin_percent": 20,
  "vat_percent": 10,
  "quotation_status": "Draft"
}
```

### Update Quotation Status
```http
PATCH /quotations/:id/status
```

**Request Body:**
```json
{
  "status": "Submitted"
}
```

**Valid Status Values:**
- Draft
- Submitted
- Approved
- Rejected

### Delete Quotation
```http
DELETE /quotations/:id
```

**Response:**
```json
{
  "message": "Quotation deleted successfully",
  "quotation": { ... }
}
```

### Export Quotation as PDF
```http
GET /quotations/:id/export/pdf
```

**Response:**
- Downloads PDF file directly
- Filename format: `Quotation_QT00000001_timestamp.pdf`
- Content-Type: `application/pdf`

**Example:**
```bash
curl http://localhost:5000/api/quotations/1/export/pdf --output quotation.pdf
```

### Export Quotation as Excel
```http
GET /quotations/:id/export/excel
```

**Response:**
- Downloads Excel file directly (XLSX format)
- Filename format: `Quotation_QT00000001_timestamp.xlsx`
- Content-Type: `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`

**Example:**
```bash
curl http://localhost:5000/api/quotations/1/export/excel --output quotation.xlsx
```

**Excel Structure:**
- Sheet 1: Summary (complete quotation overview)
- Sheet 2: Parts (parts breakdown)
- Sheet 3: Operations (operations details)
- Sheet 4: Auxiliary Costs (auxiliary costs details)

---

## Export Endpoints

### Export Quotation as PDF
```http
GET /quotations/:id/export/pdf
```

**Response:**
- Content-Type: `application/pdf`
- Content-Disposition: `attachment; filename="Quotation_QT00000001.pdf"`
- Binary PDF data

**Example:**
```bash
curl http://localhost:5000/api/quotations/1/export/pdf --output quotation.pdf
```

**Or open in browser:**
```
http://localhost:5000/api/quotations/1/export/pdf
```

### Export Quotation as Excel
```http
GET /quotations/:id/export/excel
```

**Response:**
- Content-Type: `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`
- Content-Disposition: `attachment; filename="Quotation_QT00000001.xlsx"`
- Binary Excel data

**Excel Structure:**
- Sheet 1: Quotation Summary (customer info, financial summary)
- Sheet 2: Parts Breakdown (all parts in table format)
- Sheet 3: Operations Detail (operations and auxiliary costs)

**Example:**
```bash
curl http://localhost:5000/api/quotations/1/export/excel --output quotation.xlsx
```

### Export All Quotations as Excel
```http
GET /quotations/export/excel/list
```

**Response:**
- Content-Type: `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`
- Content-Disposition: `attachment; filename="Quotations_List_YYYY-MM-DD.xlsx"`
- Binary Excel data

**Excel Structure:**
- Single sheet with all quotations in table format
- Columns: Quote Number, Customer, Date, Currency, Total Value, Status

**Example:**
```bash
curl http://localhost:5000/api/quotations/export/excel/list --output quotations_list.xlsx
```

---

## Cost Calculation

The system automatically calculates all costs when creating or retrieving quotations:

### Part-Level Calculations

1. **Unit Operations Cost** = Sum of (Machine Hourly Rate × Operation Time) for all operations
2. **Unit Auxiliary Cost** = Sum of all auxiliary costs for the part
3. **Unit Total Cost** = Material Cost + Operations Cost + Auxiliary Cost
4. **Part Subtotal** = Unit Total Cost × Quantity

### Quotation-Level Calculations

1. **Total Parts Cost** = Sum of all Part Subtotals
2. **Subtotal** = Total Parts Cost
3. **Discount Amount** = Subtotal × (Discount % / 100)
4. **After Discount** = Subtotal - Discount Amount
5. **Margin Amount** = After Discount × (Margin % / 100)
6. **After Margin** = After Discount + Margin Amount
7. **VAT Amount** = After Margin × (VAT % / 100)
8. **Total Quote Value** = After Margin + VAT Amount

All calculations are performed server-side and stored in the database.

---

## Error Codes

| Status Code | Description |
|-------------|-------------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request (validation error) |
| 404 | Not Found |
| 500 | Internal Server Error |

---

## Notes

- All monetary values are stored and returned as strings with 2 decimal places
- All IDs are auto-generated by the database
- Timestamps are in ISO 8601 format
- Soft deletes are used (is_active flag) for master data
- Hard deletes are used for quotations (CASCADE on parts and operations)
