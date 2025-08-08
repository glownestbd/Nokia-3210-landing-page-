async submitForm() {
  if (this.isSubmitting) return;
  this.isSubmitting = true;
  const form = document.getElementById('order-form');
  const submitBtn = document.getElementById('submit-btn');
  submitBtn.disabled = true;
  submitBtn.querySelector('.spinner').style.display = 'inline-block'; // Ensure spinner is visible
  form.querySelectorAll('input, button').forEach(el => (el.disabled = true));

  try {
    // Prepare form data
    const formData = new FormData(form);
    
    // Log form data for debugging (remove in production)
    for (const [key, value] of formData.entries()) {
      console.log(`${key}: ${value}`);
    }

    const response = await fetch(form.action, {
      method: 'POST',
      body: formData,
      headers: { 'Accept': 'application/json' },
      // Add timeout to prevent hanging
      signal: AbortSignal.timeout(10000), // 10-second timeout
    });

    // Check if response is successful
    if (response.ok) {
      const result = await response.json(); // Parse JSON response if server returns it
      alert('অর্ডার সফলভাবে জমা দেওয়া হয়েছে!');
      
      // Fully reset form and internal state
      form.reset();
      this.quantities = { black: 1, blue: 1 }; // Reset quantities
      this.shipping = this.config.shipping.outsideDhaka; // Reset to default shipping
      this.selectedProduct = 'black'; // Reset to default product
      this.selectProduct('black'); // Update UI
      document.getElementById('confirmation-modal').style.display = 'none';
    } else {
      // Parse error response for more specific feedback
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.message || `অর্ডার জমা দেওয়ার সময় ত্রুটি। স্ট্যাটাস: ${response.status}`;
      console.error('Submission error:', errorData);
      alert(errorMessage);
    }
  } catch (error) {
    // Handle network errors, timeouts, or other issues
    console.error('Submission failed:', error);
    let errorMessage = 'ইন্টারনেট সংযোগ ত্রুটি। আবার চেষ্টা করুন।';
    if (error.name === 'TimeoutError') {
      errorMessage = 'অনুরোধের সময় শেষ। দয়া করে আবার চেষ্টা করুন।';
    } else if (error.name === 'AbortError') {
      errorMessage = 'অর্ডার জমা বাতিল করা হয়েছে।';
    }
    alert(errorMessage);
  } finally {
    // Always restore form state
    this.isSubmitting = false;
    submitBtn.disabled = false;
    submitBtn.querySelector('.spinner').style.display = 'none';
    form.querySelectorAll('input, button').forEach(el => (el.disabled = false));
    // Refocus submit button for accessibility
    submitBtn.focus();
  }
}