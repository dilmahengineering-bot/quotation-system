const axios = require('axios');
const fs = require('fs');
const path = require('path');

async function testExports() {
  try {
    console.log('🧪 Testing Export Functionality...\n');

    // Login
    const loginRes = await axios.post('http://localhost:5000/api/auth/login', {
      username: 'admin',
      password: 'admin123'
    });
    const token = loginRes.data.token;
    console.log('✅ Logged in successfully\n');

    // Get quotations
    const quotationsRes = await axios.get('http://localhost:5000/api/quotations', {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    const quotations = quotationsRes.data;
    console.log(`📋 Found ${quotations.length} quotations\n`);

    if (quotations.length === 0) {
      console.log('❌ No quotations found to test exports');
      return;
    }

    const testQuotation = quotations[0];
    console.log(`Testing with Quotation: ${testQuotation.quote_number}\n`);

    // Test PDF Export
    console.log('📄 Testing PDF Export...');
    try {
      const pdfRes = await axios.get(
        `http://localhost:5000/api/quotations/${testQuotation.quotation_id}/export/pdf`,
        {
          headers: { Authorization: `Bearer ${token}` },
          responseType: 'arraybuffer'
        }
      );
      
      if (pdfRes.data && pdfRes.data.byteLength > 0) {
        console.log(`✅ PDF Export successful (${(pdfRes.data.byteLength / 1024).toFixed(2)} KB)`);
        
        // Save test file
        const testPdfPath = path.join(__dirname, 'test-export.pdf');
        fs.writeFileSync(testPdfPath, pdfRes.data);
        console.log(`   Saved to: ${testPdfPath}\n`);
      } else {
        console.log('❌ PDF Export returned empty data\n');
      }
    } catch (error) {
      console.log(`❌ PDF Export failed: ${error.response?.data?.error || error.message}\n`);
    }

    // Test Excel Export
    console.log('📊 Testing Excel Export...');
    try {
      const excelRes = await axios.get(
        `http://localhost:5000/api/quotations/${testQuotation.quotation_id}/export/excel`,
        {
          headers: { Authorization: `Bearer ${token}` },
          responseType: 'arraybuffer'
        }
      );
      
      if (excelRes.data && excelRes.data.byteLength > 0) {
        console.log(`✅ Excel Export successful (${(excelRes.data.byteLength / 1024).toFixed(2)} KB)`);
        
        // Save test file
        const testExcelPath = path.join(__dirname, 'test-export.xlsx');
        fs.writeFileSync(testExcelPath, excelRes.data);
        console.log(`   Saved to: ${testExcelPath}\n`);
      } else {
        console.log('❌ Excel Export returned empty data\n');
      }
    } catch (error) {
      console.log(`❌ Excel Export failed: ${error.response?.data?.error || error.message}\n`);
    }

    console.log('✅ Export testing complete!');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

testExports();
