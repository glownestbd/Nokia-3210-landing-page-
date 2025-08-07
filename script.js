const App = {
  config: { basePrice: 2599, shipping: { insideDhaka: 70, outsideDhaka: 120 }, maxQuantity: 10 },
  quantities: { black: 1, blue: 1 },
  shipping: 120, // Default to outside Dhaka
  selectedProduct: 'black',
  isSubmitting: false,

  init() {
    this.bindEvents();
    this.selectProduct('black');
    this.setupBackToTop();
  },

  bindEvents() {
    document.getElementById('order-form').addEventListener('submit', e => {
      e.preventDefault();
      if (this.validateForm()) this.showConfirmationModal();
    });

    document.querySelector('.form-container').addEventListener('click', e => {
      const product = e.target.closest('.product');
      if (product) {
        const color = product.id.includes('black') ? 'black' : 'blue';
        this.selectProduct(color);
      }
    });

    document.querySelector('.form-container').addEventListener('keydown', e => {
      const product = e.target.closest('.product');
      if (product && (e.key === 'Enter' || e.key === ' ')) {
        e.preventDefault();
        const color = product.id.includes('black') ? 'black' : 'blue';
        this.selectProduct(color);
      }
    });

    document.querySelectorAll('.quantity button').forEach(btn => {
      btn.addEventListener('click', () => {
        const color = btn.id.includes('black') ? 'black' : 'blue';
        const delta = btn.id.includes('minus') ? -1 : 1;
        this.changeQty(color, delta);
      });
      btn.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          btn.click();
        }
      });
    });

    document.querySelectorAll('.accordion button').forEach(btn => {
      btn.addEventListener('click', () => this.toggleAccordion(btn.getAttribute('data-accordion')));
    });

    document.querySelectorAll('input[name="shipping"]').forEach(input => {
      input.addEventListener('change', () => this.updateShipping(parseInt(input.value)));
    });

    document.querySelector('#confirmation-modal .confirm-btn').addEventListener('click', () => this.submitForm());
    document.querySelector('#confirmation-modal .cancel-btn').addEventListener('click', () => {
      document.getElementById('confirmation-modal').style.display = 'none';
      document.getElementById('submit-btn').focus();
    });
  },

  setupBackToTop() {
    const backToTop = document.getElementById('back-to-top');
    window.addEventListener('scroll', () => {
      backToTop.style.display = window.scrollY > 300 ? 'block' : 'none';
    });
    backToTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  },

  toggleAccordion(id) {
    const content = document.getElementById(id);
    const button = document.querySelector(`button[data-accordion="${id}"]`);
    const icon = document.getElementById(`icon-${id}`);
    const isActive = content.classList.contains('show');

    document.querySelectorAll('.accordion-content').forEach(c => c.classList.remove('show'));
    document.querySelectorAll('.accordion button').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.accordion span').forEach(s => s.innerText = '➕');

    if (!isActive) {
      content.classList.add('show');
      button.classList.add('active');
      icon.innerText = '➖';
    }
  },

  selectProduct(color) {
    this.selectedProduct = color;
    document.getElementById('radio-black').checked = color === 'black';
    document.getElementById('radio-blue').checked = color === 'blue';
    document.getElementById('qty-black-box').style.display = color === 'black' ? 'flex' : 'none';
    document.getElementById('qty-blue-box').style.display = color === 'blue' ? 'flex' : 'none';
    document.getElementById('product-black').classList.toggle('selected', color === 'black');
    document.getElementById('product-blue').classList.toggle('selected', color === 'blue');
    document.getElementById('product-black').setAttribute('aria-checked', color === 'black');
    document.getElementById('product-blue').setAttribute('aria-checked', color === 'blue');
    this.updateTotals();
    this.updateButtonsState();
  },

  changeQty(color, delta) {
    if (color !== this.selectedProduct || this.isSubmitting) return;
    const newQty = this.quantities[color] + delta;
    if (newQty < 1 || newQty > this.config.maxQuantity) {
      const message = newQty < 1 ? 'পরিমাণ ১ এর কম হতে পারে না' : `পরিমাণ ${this.config.maxQuantity} এর বেশি হতে পারে না`;
      document.getElementById('qty-error').style.display = 'block';
      document.getElementById('qty-error').innerText = message;
      setTimeout(() => {
        document.getElementById('qty-error').style.display = 'none';
      }, 3000);
      return;
    }
    this.quantities[color] = newQty;
    document.getElementById(`qty-${color}`).value = newQty;
    this.updateTotals();
    this.updateButtonsState();
  },

  updateShipping(amount) {
    this.shipping = amount;
    this.updateTotals();
  },

  updateTotals() {
    const subtotal = this.config.basePrice * this.quantities[this.selectedProduct];
    const total = subtotal + this.shipping;
    document.getElementById('subtotal').innerText = `৳${subtotal.toLocaleString('bn-BD')}`;
    document.getElementById('total').innerText = `৳${total.toLocaleString('bn-BD')}`;
    document.getElementById('hiddenSubtotal').value = subtotal;
    document.getElementById('hiddenTotal').value = total;
    document.getElementById('hiddenProduct').value = this.selectedProduct === 'black' ? 'Nokia 3210 (Black)' : 'Nokia 3210 (Blue)';
    document.getElementById('hiddenQuantity').value = this.quantities[this.selectedProduct];
  },

  updateButtonsState() {
    const color = this.selectedProduct;
    document.getElementById(`btn-minus-${color}`).disabled = this.quantities[color] <= 1;
  },

  validateForm() {
    const name = document.getElementById('name').value;
    const phone = document.getElementById('phone').value;
    const address = document.getElementById('address').value;
    const nameRegex = /^[A-Za-z\s]+$/;
    const phoneRegex = /^01[3-9][0-9]{8}$/;
    let valid = true;

    document.querySelectorAll('.error').forEach(e => e.style.display = 'none');

    if (!nameRegex.test(name)) {
      document.getElementById('name-error').style.display = 'block';
      valid = false;
    }
    if (!phoneRegex.test(phone)) {
      document.getElementById('phone-error').style.display = 'block';
      valid = false;
    }
    if (address.trim() === '') {
      document.getElementById('address-error').style.display = 'block';
      valid = false;
    }

    return valid;
  },

  showConfirmationModal() {
    const modalContent = `
      পণ্য: ${document.getElementById('hiddenProduct').value}<br>
      পরিমাণ: ${document.getElementById('hiddenQuantity').value}<br>
      মোট: ${document.getElementById('total').innerText}<br>
      ঠিকানা: ${document.getElementById('address').value}
    `;
    document.getElementById('modal-content').innerHTML = modalContent;
    document.getElementById('confirmation-modal').style.display = 'block';
  },

  async submitForm() {
    if (this.isSubmitting) return;
    this.isSubmitting = true;
    const form = document.getElementById('order-form');
    const submitBtn = document.getElementById('submit-btn');
    submitBtn.disabled = true;
    submitBtn.querySelector('.spinner').style.display = 'inline';
    form.querySelectorAll('input, button').forEach(el => el.disabled = true);

    try {
      const response = await fetch(form.action, {
        method: 'POST',
        body: new FormData(form),
        headers: { 'Accept': 'application/json' }
      });
      if (response.ok) {
        alert('অর্ডার সফলভাবে জমা দেওয়া হয়েছে!');
        form.reset();
        this.selectProduct('black');
        document.getElementById('confirmation-modal').style.display = 'none';
      } else {
        alert('অর্ডার জমা দেওয়ার সময় ত্রুটি। আবার চেষ্টা করুন।');
      }
    } catch (error) {
      alert('ইন্টারনেট সংযোগ ত্রুটি। আবার চেষ্টা করুন।');
    } finally {
      submitBtn.disabled = false;
      submitBtn.querySelector('.spinner').style.display = 'none';
      form.querySelectorAll('input, button').forEach(el => el.disabled = false);
      this.isSubmitting = false;
    }
  }
};

window.onload = () => App.init();

