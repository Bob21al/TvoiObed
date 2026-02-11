// DOM elements
const navItems = document.querySelectorAll('.nav-item');
const pages = document.querySelectorAll('.page');
const addButtons = document.querySelectorAll('.add-btn');
const secondaryBtn = document.querySelector('.secondary-btn');
const bigButton = document.querySelector('.big-button');
const userProfile = document.getElementById('user-profile-clickable');

// Orders and Favorites functionality
let orders = JSON.parse(localStorage.getItem('orders')) || [];
let favorites = JSON.parse(localStorage.getItem('favorites')) || [];

// Function to save orders to localStorage
function saveOrders() {
  localStorage.setItem('orders', JSON.stringify(orders));
}

// Function to save favorites to localStorage
function saveFavorites() {
  localStorage.setItem('favorites', JSON.stringify(favorites));
}

// Function to check if a dish is in favorites
function isInFavorites(dishName) {
  return favorites.some(fav => fav.name === dishName);
}

// Function to check if a dish is in orders
function isInOrders(dishName) {
  return orders.some(order => order.name === dishName);
}

// Function to add dish to favorites
function addToFavorites(dishName, calories, price) {
  if (!isInFavorites(dishName)) {
    favorites.push({ name: dishName, calories: calories, price: price });
    saveFavorites();
    updateFavoritesDisplay();
    initFavoriteButtons(); // Update buttons on menu page
  }
}

// Function to remove dish from favorites
function removeFromFavorites(dishName) {
  favorites = favorites.filter(fav => fav.name !== dishName);
  saveFavorites();
  updateFavoritesDisplay();
  initFavoriteButtons(); // Update buttons on menu page
}

// Function to add dish to orders
function addToOrders(dishName, calories, price) {
  // Check if already in orders
  const existingOrder = orders.find(order => order.name === dishName);
  if (existingOrder) {
    existingOrder.quantity += 1;
  } else {
    orders.push({ name: dishName, calories: calories, price: price, quantity: 1 });
  }
  saveOrders();
  updateOrdersDisplay();
}

// Function to remove dish from orders
function removeFromOrders(dishName) {
  orders = orders.filter(order => order.name !== dishName);
  saveOrders();
  updateOrdersDisplay();
}

// Function to update the orders page display
function updateOrdersDisplay() {
  const ordersContainer = document.getElementById('orders-page');
  if (ordersContainer) {
    // Preserve the order placement section if it exists
    const orderPlacementSection = ordersContainer.querySelector('.order-placement');
    let orderPlacementHtml = '';
    
    if (orderPlacementSection) {
      // Preserve the entire order placement section including the calendar
      orderPlacementHtml = orderPlacementSection.outerHTML;
    }
    
    if (orders.length === 0) {
      ordersContainer.innerHTML = `
        <h2>Заказы</h2>
        <div class="empty-state">
          <p>Пока нет заказов</p>
          <button class="secondary-btn" onclick="switchPage('today')">Перейти в меню</button>
        </div>
        ${orderPlacementHtml}
      `;
    } else {
      let ordersHtml = '<h2>Заказы</h2><div class="menu-items">';
      orders.forEach((order, index) => {
        // Extract numeric price from the string (e.g., "100 ₽")
        const priceMatch = order.price ? order.price.match(/(\d+)/) : null;
        const price = priceMatch ? parseInt(priceMatch[0]) : 0;
        const totalPriceForItem = price * order.quantity;
        
        ordersHtml += `
          <div class="menu-card">
            <h3>${order.name}</h3>
            <p class="calories">${order.calories} • Количество: ${order.quantity}</p>
            <p class="price">${order.price}</p>
            <button class="remove-order-btn" data-name="${order.name}">Удалить</button>
          </div>
        `;
      });
      ordersHtml += '</div>' + orderPlacementHtml;
      ordersContainer.innerHTML = ordersHtml;
      
      // Add event listeners to remove buttons
      document.querySelectorAll('.remove-order-btn').forEach(btn => {
        btn.addEventListener('click', function() {
          const dishName = this.getAttribute('data-name');
          removeFromOrders(dishName);
        });
      });
      
    }
    
    // Initialize order placement functionality if there are orders
    if (orders.length > 0) {
      const placementSection = document.querySelector('.order-placement');
      if (placementSection) {
        placementSection.style.display = 'block';
        // Reinitialize calendar and custom selects when showing the order placement section
        setTimeout(() => {
          initializeCalendar();
          initializeCustomSelects();
        }, 10);
      }
      updateOrderSummary();
    } else {
      const placementSection = document.querySelector('.order-placement');
      if (placementSection) {
        placementSection.style.display = 'none';
      }
      updateOrderSummary(); // Update summary to clear it when no orders
    }
    
    // Reinitialize calendar and custom selects after updating the display
    setTimeout(() => {
      initializeCalendar();
      initializeCustomSelects();
    }, 10);
  }
}

// Function to update the order summary
function updateOrderSummary() {
  const summaryList = document.getElementById('order-summary-list');
  const totalCaloriesEl = document.getElementById('total-calories');
  const totalPriceValueEl = document.getElementById('total-price-value');
  
  if (!summaryList || !totalCaloriesEl) return;
  
  let totalCalories = 0;
  let totalPrice = 0;
  let summaryHtml = '';
  
  orders.forEach(order => {
    // Extract numeric calories from the string (e.g., "150 ккал")
    const calorieMatch = order.calories.match(/(\d+)/);
    const calories = calorieMatch ? parseInt(calorieMatch[0]) : 0;
    const totalCalForItem = calories * order.quantity;
    totalCalories += totalCalForItem;
    
    // Extract numeric price from the string (e.g., "100 ₽")
    const priceMatch = order.price ? order.price.match(/(\d+)/) : null;
    const price = priceMatch ? parseInt(priceMatch[0]) : 0;
    const totalPriceForItem = price * order.quantity;
    totalPrice += totalPriceForItem;
    
    summaryHtml += `
      <div class="order-item-summary">
        <span>${order.name} × ${order.quantity}</span>
        <span>${totalCalForItem} ккал</span>
        <span>${totalPriceForItem} ₽</span>
      </div>
    `;
  });
  
  summaryList.innerHTML = summaryHtml;
  
  // Update the total calories and total price
  totalCaloriesEl.textContent = totalCalories;
  
  if (totalPriceValueEl) {
    totalPriceValueEl.textContent = totalPrice;
  }
}


// Function to show notifications
function showNotification(message, type = 'error') {
  // Remove any existing notifications
  const existingNotifications = document.querySelectorAll('.notification');
  existingNotifications.forEach(notification => notification.remove());
  
  const notification = document.createElement('div');
  notification.className = `notification ${type}`;
  notification.textContent = message;
  
  document.body.appendChild(notification);
  
  // Trigger the show animation
  setTimeout(() => {
    notification.classList.add('show');
  }, 10);
  
  // Auto-remove after 3 seconds
  setTimeout(() => {
    notification.classList.remove('show');
    setTimeout(() => {
      if (notification.parentNode) {
        notification.remove();
      }
    }, 300);
  }, 3000);
}

// Function to show confirmation modal
function showConfirmationModal(message, onConfirm, onCancel, confirmButtonText = 'Оплатить', cancelButtonText = 'Отмена') {
  const modal = document.getElementById('confirmation-modal');
  const messageElement = document.getElementById('confirmation-message');
  const confirmBtn = document.getElementById('confirm-payment-btn');
  const cancelBtn = document.getElementById('cancel-confirm-btn');
  
  // Set the message
  messageElement.textContent = message;
  
  // Update button texts
  if (confirmBtn) {
    confirmBtn.textContent = confirmButtonText;
  }
  if (cancelBtn) {
    cancelBtn.textContent = cancelButtonText;
  }
  
  // Remove any existing event listeners to prevent multiple bindings
  const confirmBtnClone = confirmBtn.cloneNode(true);
  const cancelBtnClone = cancelBtn.cloneNode(true);
  confirmBtn.parentNode.replaceChild(confirmBtnClone, confirmBtn);
  cancelBtn.parentNode.replaceChild(cancelBtnClone, cancelBtn);
  
  // Get the new buttons
  const newConfirmBtn = document.getElementById('confirm-payment-btn');
  const newCancelBtn = document.getElementById('cancel-confirm-btn');
  
  // Add event listeners
  newConfirmBtn.onclick = function() {
    hideConfirmationModal();
    if (onConfirm) onConfirm();
  };
  
  newCancelBtn.onclick = function() {
    hideConfirmationModal();
    if (onCancel) onCancel();
  };
  
  // Show the modal
  modal.classList.add('show');
}

// Function to hide confirmation modal
function hideConfirmationModal() {
  const modal = document.getElementById('confirmation-modal');
  modal.classList.remove('show');
}

// Global variable to store the payment callback
let paymentCallback = null;

// Toggle mobile menu
function toggleMobileMenu() {
  const sidebar = document.querySelector('.sidebar-main');
  sidebar.classList.toggle('mobile-open');
}

// Add event listener for document click to handle the modal
document.addEventListener('DOMContentLoaded', () => {
  // Handle clicking outside the modal to close it
  const modal = document.getElementById('confirmation-modal');
  if (modal) {
    modal.addEventListener('click', function(e) {
      if (e.target === modal) {
        hideConfirmationModal();
        if (paymentCallback && paymentCallback.onCancel) {
          paymentCallback.onCancel();
        }
      }
    });
  }
  
  // Add event listener for mobile menu toggle
  const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
  if (mobileMenuToggle) {
    mobileMenuToggle.addEventListener('click', function(e) {
      e.stopPropagation();
      toggleMobileMenu();
    });
  }
  
  // Close mobile menu when clicking outside
  document.addEventListener('click', function(e) {
    const sidebar = document.querySelector('.sidebar-main');
    const hamburger = document.getElementById('mobile-menu-toggle');
    
    if (window.innerWidth <= 768 && 
        sidebar.classList.contains('mobile-open') &&
        !sidebar.contains(e.target) && 
        !hamburger.contains(e.target)) {
      sidebar.classList.remove('mobile-open');
    }
  });
});

// Function to place the order
function placeOrder() {
  const dateSelect = document.getElementById('order-date');
  const timeSelect = document.getElementById('order-time');
  const deliverySelect = document.getElementById('delivery-option');
  
  const selectedDate = dateSelect.value;
  const selectedTime = timeSelect.getAttribute('data-value') || timeSelect.value;
  const selectedDelivery = deliverySelect.getAttribute('data-value') || deliverySelect.value;
  
  if (!selectedDate || !selectedTime || !selectedDelivery) {
    showNotification('Пожалуйста, заполните все поля для оформления заказа', 'error');
    return;
  }
  
  // Create order object
  const orderDetails = {
    id: Date.now(), // Simple ID generation
    date: selectedDate,
    time: selectedTime,
    delivery: selectedDelivery,
    items: [...orders], // Copy current orders
    timestamp: new Date().toISOString(),
    status: 'pending'
  };
  
  // Get existing placed orders or initialize empty array
  let placedOrders = JSON.parse(localStorage.getItem('placedOrders')) || [];
  
  // Add new order
  placedOrders.push(orderDetails);
  
  // Save to localStorage
  localStorage.setItem('placedOrders', JSON.stringify(placedOrders));
  
  // Clear current orders
  orders = [];
  saveOrders();
  
  // Update UI
  updateOrdersDisplay();
  
  // Show success message
  showNotification('Заказ успешно оформлен!', 'success');
  
  // Reset form
  dateSelect.value = '';
  timeSelect.value = '';
  timeSelect.removeAttribute('data-value');
  deliverySelect.value = '';
  deliverySelect.removeAttribute('data-value');
}

// Function to cancel the order
function cancelOrder() {
  // Get all order item elements to animate them
  const orderItems = document.querySelectorAll('#orders-page .menu-card');
  
  // Apply fade out animation to each order item
  orderItems.forEach((item, index) => {
    setTimeout(() => {
      item.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
      item.style.opacity = '0';
      item.style.transform = 'translateX(-20px)';
      
      // After animation completes, clear orders and update UI
      if (index === orderItems.length - 1) { // Only do this once, after the last item starts animating
        setTimeout(() => {
          // Clear current orders
          orders = [];
          saveOrders();
          
          // Update UI
          updateOrdersDisplay();
          
          // Reset form
          const dateSelect = document.getElementById('order-date');
          const timeSelect = document.getElementById('order-time');
          const deliverySelect = document.getElementById('delivery-option');
          
          if(dateSelect) dateSelect.value = '';
          if(timeSelect) {
            timeSelect.value = '';
            timeSelect.removeAttribute('data-value');
          }
          if(deliverySelect) {
            deliverySelect.value = '';
            deliverySelect.removeAttribute('data-value');
          }
          
          // Show success notification
          showNotification('Заказ отменен', 'success');
        }, 300); // Match the animation duration
      }
    }, index * 50); // Stagger the animations slightly
  });
  
  // If there are no order items, just clear immediately
  if (orderItems.length === 0) {
    // Clear current orders
    orders = [];
    saveOrders();
    
    // Update UI
    updateOrdersDisplay();
    
    // Reset form
    const dateSelect = document.getElementById('order-date');
    const timeSelect = document.getElementById('order-time');
    const deliverySelect = document.getElementById('delivery-option');
    
    if(dateSelect) dateSelect.value = '';
    if(timeSelect) {
      timeSelect.value = '';
      timeSelect.removeAttribute('data-value');
    }
    if(deliverySelect) {
      deliverySelect.value = '';
      deliverySelect.removeAttribute('data-value');
    }
    
    // Show success notification
    showNotification('Заказ отменен', 'success');
  }
}


// Function to handle payment (fake payment)
function payOrder() {
  if (orders.length === 0) {
    showNotification('Нет блюд в заказе', 'error');
    return;
  }
  
  const dateSelect = document.getElementById('order-date');
  const timeSelect = document.getElementById('order-time');
  const deliverySelect = document.getElementById('delivery-option');
  
  const selectedDate = dateSelect.value;
  const selectedTime = timeSelect.getAttribute('data-value') || timeSelect.value;
  const selectedDelivery = deliverySelect.getAttribute('data-value') || deliverySelect.value;
  
  if (!selectedDate || !selectedTime || !selectedDelivery) {
    showNotification('Пожалуйста, заполните все поля для оформления заказа', 'error');
    return;
  }
  
  // Calculate total price
  let totalPrice = 0;
  orders.forEach(order => {
    const priceMatch = order.price ? order.price.match(/(\d+)/) : null;
    const price = priceMatch ? parseInt(priceMatch[0]) : 0;
    totalPrice += price * order.quantity;
  });
  
  // Show confirmation modal
  showConfirmationModal(
    `Подтвердите оплату заказа на сумму ${totalPrice} ₽`,
    function() {
      // This is called when user confirms
      // Simulate payment processing
      showNotification('Платеж обработан успешно! Ваш заказ принят.', 'success');
      
      // Move the order to placed orders
      const orderDetails = {
        id: Date.now(),
        date: selectedDate,
        time: selectedTime,
        delivery: selectedDelivery,
        items: [...orders],
        timestamp: new Date().toISOString(),
        status: 'paid'
      };
      
      let placedOrders = JSON.parse(localStorage.getItem('placedOrders')) || [];
      placedOrders.push(orderDetails);
      localStorage.setItem('placedOrders', JSON.stringify(placedOrders));
      
      // Clear current orders
      orders = [];
      saveOrders();
      
      // Update UI
      updateOrdersDisplay();
      
      // Reset form
      dateSelect.value = '';
      timeSelect.value = '';
      timeSelect.removeAttribute('data-value');
      deliverySelect.value = '';
      deliverySelect.removeAttribute('data-value');
    },
    function() {
      // This is called when user cancels
      // Optional: do nothing or log cancellation
      console.log('Payment canceled by user');
    },
    'Оплатить', // Confirm button text
    'Отмена'    // Cancel button text
  );
}

// Function to update the favorites page display
function updateFavoritesDisplay() {
  const favoritesContainer = document.getElementById('favorites-page');
  if (favoritesContainer) {
    if (favorites.length === 0) {
      favoritesContainer.innerHTML = `
        <h2>Избранное</h2>
        <div class="empty-state">
          <p>Пока нет избранных блюд</p>
        </div>
      `;
    } else {
      let favoritesHtml = '<h2>Избранное</h2><div class="menu-items">';
      favorites.forEach((fav, index) => {
        favoritesHtml += `
          <div class="menu-card">
            <h3>${fav.name}</h3>
            <p class="calories">${fav.calories}</p>
            <p class="price">${fav.price || ''}</p>
            <button class="remove-fav-btn" data-name="${fav.name}">Удалить</button>
          </div>
        `;
      });
      favoritesHtml += '</div>';
      favoritesContainer.innerHTML = favoritesHtml;
      
      // Add event listeners to remove buttons
      document.querySelectorAll('.remove-fav-btn').forEach(btn => {
        btn.addEventListener('click', function() {
          const dishName = this.getAttribute('data-name');
          removeFromFavorites(dishName);
        });
      });
    }
  }
}

// Function to initialize favorite buttons on the today's menu page
function initFavoriteButtons() {
  const menuCards = document.querySelectorAll('#today-page .menu-card');
  menuCards.forEach(card => {
    const dishName = card.querySelector('h3').textContent;
    const favBtn = card.querySelector('.fav-btn');
    
    if (isInFavorites(dishName)) {
      favBtn.classList.add('favorited');
      favBtn.textContent = '★';
    } else {
      favBtn.classList.remove('favorited');
      favBtn.textContent = '☆';
    }
  });
}

// Initialize favorites display when favorites page loads
function initFavoritesPage() {
  updateFavoritesDisplay();
}

// Function to initialize my orders page
function initMyOrdersPage() {
  updateMyOrdersDisplay();
}

// Function to update the my orders page display
function updateMyOrdersDisplay() {
  const myOrdersContainer = document.getElementById('my-orders-list');
  if (!myOrdersContainer) return;
  
  // Get placed orders from localStorage
  const placedOrders = JSON.parse(localStorage.getItem('placedOrders')) || [];
  
  if (placedOrders.length === 0) {
    myOrdersContainer.innerHTML = '<p>У вас пока нет заказов</p>';
    return;
  }
  
  // Sort orders by date (newest first)
  placedOrders.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  
  let ordersHtml = '<div class="my-orders-list">';
  
  placedOrders.forEach((order, index) => {
    const orderDate = new Date(order.timestamp).toLocaleDateString('ru-RU');
    const orderTime = order.time === 'breakfast' ? 'Завтрак' : 'Обед';
    const orderDelivery = order.delivery === 'cafeteria' ? 'В столовой' : 'С собой';
    
    ordersHtml += `
      <div class="my-order-card">
        <div class="order-header">
          <h3>Заказ от ${orderDate}</h3>
          <span class="order-status ${order.status}">${order.status === 'paid' ? 'Оплачен' : 'В обработке'}</span>
        </div>
        <div class="order-details">
          <p><strong>Дата доставки:</strong> ${order.date}</p>
          <p><strong>Время:</strong> ${orderTime}</p>
          <p><strong>Получение:</strong> ${orderDelivery}</p>
        </div>
        <div class="order-items">
          <h4>Состав заказа:</h4>
          <ul>
    `;
    
    order.items.forEach(item => {
      ordersHtml += `<li>${item.name} × ${item.quantity} (${item.calories})</li>`;
    });
    
    ordersHtml += `
          </ul>
        </div>
        <div class="order-total">
          <p><strong>Итого:</strong> ${order.items.reduce((total, item) => {
            const priceMatch = item.price ? item.price.match(/(\d+)/) : null;
            const price = priceMatch ? parseInt(priceMatch[0]) : 0;
            return total + (price * item.quantity);
          }, 0)} ₽</p>
        </div>
        <div class="order-actions">
          ${order.status === 'paid' ? 
            `<button class="cancel-order-btn" data-order-id="${order.id}">Отменить заказ</button>` : 
            '<span class="processing">Обработка заказа...</span>'
          }
        </div>
      </div>
    `;
  });
  
  ordersHtml += '</div>';
  myOrdersContainer.innerHTML = ordersHtml;
  
  // Add event listeners to cancel buttons
  document.querySelectorAll('.cancel-order-btn').forEach(button => {
    button.addEventListener('click', function() {
      const orderId = this.getAttribute('data-order-id');
      cancelPlacedOrder(orderId);
    });
  });
}

// Function to cancel a placed order
function cancelPlacedOrder(orderId) {
  // Show confirmation modal
  showConfirmationModal(
    'Вы уверены, что хотите отменить этот заказ?',
    function() {
      // Get existing placed orders
      let placedOrders = JSON.parse(localStorage.getItem('placedOrders')) || [];
      
      // Remove the order with specified ID
      placedOrders = placedOrders.filter(order => order.id != orderId);
      
      // Save updated orders
      localStorage.setItem('placedOrders', JSON.stringify(placedOrders));
      
      // Update UI
      updateMyOrdersDisplay();
      
      // Show success notification
      showNotification('Заказ успешно отменен', 'success');
    },
    function() {
      // User cancelled, do nothing
      console.log('Order cancellation cancelled by user');
    },
    'Отменить', // Confirm button text
    'Оставить'  // Cancel button text
  );
}

// Profile functionality
let userProfileData = JSON.parse(localStorage.getItem('userProfileData')) || {
  firstName: '',
  lastName: '',
  className: '',
  allergies: ''
};

// Flag to track if profile page has been initialized after save
let profilePageInitialized = false;

// Function to save profile data to localStorage
function saveProfileData() {
  localStorage.setItem('userProfileData', JSON.stringify(userProfileData));
}

// Function to load profile data from localStorage and populate form
function loadProfileForm() {
  const firstNameInput = document.getElementById('first-name');
  const lastNameInput = document.getElementById('last-name');
  const classSelect = document.getElementById('class-select');
  const allergiesTextarea = document.getElementById('allergies');
  
  if(firstNameInput) firstNameInput.value = userProfileData.firstName || '';
  if(lastNameInput) lastNameInput.value = userProfileData.lastName || '';
  if(classSelect) classSelect.value = userProfileData.className || '';
  if(allergiesTextarea) allergiesTextarea.value = userProfileData.allergies || '';
}

// Function to save profile form data
function saveProfileForm() {
  const firstNameInput = document.getElementById('first-name');
  const lastNameInput = document.getElementById('last-name');
  const classSelect = document.getElementById('class-select');
  const allergiesTextarea = document.getElementById('allergies');
  
  if(firstNameInput) userProfileData.firstName = firstNameInput.value;
  if(lastNameInput) userProfileData.lastName = lastNameInput.value;
  if(classSelect) userProfileData.className = classSelect.value;
  if(allergiesTextarea) userProfileData.allergies = allergiesTextarea.value;
  
  saveProfileData();
  
  // Update username in profile section
  const usernameElement = document.querySelector('.username');
  if(usernameElement) {
    const fullName = `${userProfileData.firstName} ${userProfileData.lastName}`.trim();
    if (fullName) {
      usernameElement.textContent = fullName;
    } else {
      usernameElement.textContent = 'Ученик';
    }
  }
  
  // Store the current values before showing the alert
  const firstNameValue = firstNameInput ? firstNameInput.value : '';
  const lastNameValue = lastNameInput ? lastNameInput.value : '';
  const classValue = classSelect ? classSelect.value : '';
  const allergiesValue = allergiesTextarea ? allergiesTextarea.value : '';
  
  // Show success message without interrupting user input
  const originalValue = firstNameInput ? firstNameInput.value : '';
  const originalLastName = lastNameInput ? lastNameInput.value : '';
  const originalClass = classSelect ? classSelect.value : '';
  const originalAllergies = allergiesTextarea ? allergiesTextarea.value : '';
  
  // Create a temporary notification element
  const notification = document.createElement('div');
  notification.textContent = 'Профиль успешно сохранен!';
  notification.style.position = 'fixed';
  notification.style.top = '20px';
  notification.style.right = '20px';
  notification.style.backgroundColor = 'var(--accent-primary)';
  notification.style.color = 'var(--bg-primary)';
  notification.style.padding = '10px 20px';
  notification.style.borderRadius = '8px';
  notification.style.zIndex = '1000';
  notification.style.boxShadow = 'var(--shadow)';
  document.body.appendChild(notification);
  
  // Remove the notification after 2 seconds
  setTimeout(() => {
    document.body.removeChild(notification);
  }, 2000);
  
  // Ensure the values remain as they were after the alert equivalent
  if(firstNameInput) firstNameInput.value = originalValue;
  if(lastNameInput) lastNameInput.value = originalLastName;
  if(classSelect) classSelect.value = originalClass;
  if(allergiesTextarea) allergiesTextarea.value = originalAllergies;
  
  // Reset initialization flag to allow reloading profile data on next visit
  profilePageInitialized = false;
}

// Initialize profile page
function initProfilePage() {
  // Only load saved data if form fields are empty or contain default values
  const firstNameInput = document.getElementById('first-name');
  const lastNameInput = document.getElementById('last-name');
  const classSelect = document.getElementById('class-select');
  const allergiesTextarea = document.getElementById('allergies');
  
  // Only populate fields if they're empty (first visit to profile page or after explicit reset)
  // Preserve any user input that may already be present
  if(firstNameInput && firstNameInput.value === '' && !profilePageInitialized) {
    firstNameInput.value = userProfileData.firstName || '';
  }
  if(lastNameInput && lastNameInput.value === '' && !profilePageInitialized) {
    lastNameInput.value = userProfileData.lastName || '';
  }
  if(classSelect && classSelect.value === '' && !profilePageInitialized) {
    classSelect.value = userProfileData.className || '';
  }
  if(allergiesTextarea && allergiesTextarea.value === '' && !profilePageInitialized) {
    allergiesTextarea.value = userProfileData.allergies || '';
  }
  
  // Mark that initialization has occurred
  profilePageInitialized = true;
}

// Page switching functionality with immediate hide then show animation
let currentPage = 'home'; // Track current page for direction determination
const pageOrder = ['home', 'today', 'orders', 'my-orders', 'favorites', 'profile', 'settings'];
let isPageSwitching = false;
let queuedPageId = null;
let pageSwitchTimer = null;

function runPageInitializers(pageId) {
  if (pageId === 'favorites') {
    initFavoritesPage();
  }

  if (pageId === 'today') {
    initFavoriteButtons();
  }

  if (pageId === 'orders') {
    updateOrdersDisplay();
  }

  if (pageId === 'my-orders') {
    updateMyOrdersDisplay();
  }

  if (pageId === 'profile') {
    initProfilePage();
  }
}

function switchPage(pageId) {
  // Don't do anything if we're already on the requested page
  if (currentPage === pageId && !isPageSwitching) return;

  // If animation is in progress, queue only the last requested page
  if (isPageSwitching) {
    queuedPageId = pageId;
    return;
  }
  
  const currentPageElement = document.getElementById(`${currentPage}-page`);
  const nextPageElement = document.getElementById(`${pageId}-page`);
  const mainContent = document.querySelector('.main-content');

  if (!currentPageElement || !nextPageElement) return;

  const currentIndex = pageOrder.indexOf(currentPage);
  const nextIndex = pageOrder.indexOf(pageId);
  const isForward = nextIndex >= currentIndex;
  const outClass = isForward ? 'to-left' : 'to-right';
  const inClass = isForward ? 'from-right' : 'from-left';
  const transitionDuration = 420;

  isPageSwitching = true;
  queuedPageId = null;

  // Defensive cleanup in case previous animation was interrupted
  pages.forEach(page => {
    page.classList.remove('animating-in', 'animating-out', 'from-right', 'from-left', 'to-center', 'to-left', 'to-right');
  });

  if (pageSwitchTimer) {
    clearTimeout(pageSwitchTimer);
    pageSwitchTimer = null;
  }
  
  // Update active nav item
  navItems.forEach(item => {
    item.classList.remove('active');
    if (item.dataset.page === pageId) {
      item.classList.add('active');
    }
  });
  
  // On mobile, scroll to top after page change to ensure content is visible
  if (window.innerWidth <= 768) {
    setTimeout(() => {
      window.scrollTo(0, 0);
    }, 300);
  }

  mainContent?.classList.add('is-switching');

  // Reset previous animation classes
  currentPageElement.classList.remove('animating-in', 'from-right', 'from-left', 'to-center');
  nextPageElement.classList.remove('animating-out', 'to-left', 'to-right');

  // Prepare next page start state
  nextPageElement.classList.remove('active');
  nextPageElement.classList.add('animating-in', inClass);

  // Animate current page out
  currentPageElement.classList.add('animating-out', outClass);

  // Force reflow before moving next page to center
  void nextPageElement.offsetWidth;
  nextPageElement.classList.add('to-center');

  // After animation completes, finalize
  pageSwitchTimer = setTimeout(() => {
    currentPageElement.classList.remove('active', 'animating-out', 'to-left', 'to-right');
    nextPageElement.classList.remove('animating-in', 'from-right', 'from-left', 'to-center');
    nextPageElement.classList.add('active');

    currentPage = pageId;
    mainContent?.classList.remove('is-switching');
    isPageSwitching = false;
    pageSwitchTimer = null;

    runPageInitializers(pageId);

    // Process queued click (last one wins)
    if (queuedPageId && queuedPageId !== currentPage) {
      const nextQueued = queuedPageId;
      queuedPageId = null;
      switchPage(nextQueued);
    }
  }, transitionDuration);
}

// Add event listeners to home page cards
document.addEventListener('DOMContentLoaded', () => {
  // Card for "Menu for today"
  const menuCard = document.querySelector('.cards-grid .card:first-child');
  if (menuCard) {
    menuCard.addEventListener('click', () => {
      switchPage('today');
    });
  }
  
  // Card for "Place an order"
  const orderCard = document.querySelector('.cards-grid .card:nth-child(2)');
  if (orderCard) {
    orderCard.addEventListener('click', () => {
      switchPage('orders');
    });
  }
  
  // Note: Third card "Special offers and new items" remains non-interactive as requested
});

// Add event listeners to navigation items
navItems.forEach(item => {
  item.addEventListener('click', () => {
    switchPage(item.dataset.page);
  });
});


// Add event listeners to "Add" buttons
document.addEventListener('click', function(e) {
  if (e.target.classList.contains('add-btn')) {
    const button = e.target;
    const card = button.closest('.menu-card');
    const dishName = card.querySelector('h3').textContent;
    const calories = card.querySelector('.calories').textContent;
    const priceElement = card.querySelector('.price');
    const price = priceElement ? priceElement.textContent : '0 ₽'; // Default to 0 if no price
    
    // Animation effect when clicking add button
    button.textContent = 'Добавлено';
    button.style.background = 'var(--bg-tertiary)';
    button.style.color = 'var(--text-primary)';
    
    // Add to orders
    addToOrders(dishName, calories, price);
    
    setTimeout(() => {
      button.textContent = 'Добавить';
      button.style.background = 'linear-gradient(90deg, var(--accent-primary), var(--accent-secondary))';
      button.style.color = 'var(--bg-primary)';
    }, 1000);
  }
  
  // Add event listener for favorite buttons
  if (e.target.classList.contains('fav-btn')) {
    const button = e.target;
    const card = button.closest('.menu-card');
    const dishName = card.querySelector('h3').textContent;
    const calories = card.querySelector('.calories').textContent;
    
    // Toggle favorite state
    if (button.classList.contains('favorited')) {
      // Remove from favorites
      removeFromFavorites(dishName);
      button.classList.remove('favorited');
      button.textContent = '☆'; // Empty star
    } else {
      // Add to favorites
      const priceElement = card.querySelector('.price');
      const price = priceElement ? priceElement.textContent : '0 ₽'; // Default to 0 if no price
      addToFavorites(dishName, calories, price);
      button.classList.add('favorited');
      button.textContent = '★'; // Filled star
    }
  }
});

// Secondary button functionality (for orders page)
if (secondaryBtn) {
  secondaryBtn.addEventListener('click', () => {
    switchPage('today');
  });
}

// Big button functionality (on home page)
if (bigButton) {
  bigButton.addEventListener('click', () => {
    switchPage('today');
  });
}

// Theme toggle functionality
function setTheme(isDark) {
  if (isDark) {
    document.body.classList.remove('light-theme');
    document.documentElement.classList.remove('light-theme');
  } else {
    document.body.classList.add('light-theme');
    document.documentElement.classList.add('light-theme');
  }
}

// Find theme toggle in settings page and add event listener
document.addEventListener('DOMContentLoaded', () => {
  // Set up theme toggle if it exists
  const themeToggles = document.querySelectorAll('.switch input[type="checkbox"]');
  if (themeToggles.length > 0) {
    // Use the first toggle for theme (assuming it's the dark theme toggle)
    const darkThemeToggle = themeToggles[0];
    
    // Initialize theme based on saved preference or default to dark
    const isDarkTheme = localStorage.getItem('dark-theme') !== 'false';
    darkThemeToggle.checked = isDarkTheme;
    setTheme(isDarkTheme);
    
    // Add event listener to toggle theme
    darkThemeToggle.addEventListener('change', function() {
      const isDark = this.checked;
      localStorage.setItem('dark-theme', isDark);
      setTheme(isDark);
    });
  }
  
  // Add event listener for user profile click
  userProfile?.addEventListener('click', () => {
    switchPage('profile');
  });
  
  // Set home as active by default
  switchPage('home');
  
  // Initialize favorites and orders from localStorage
  initFavoritesPage();
  updateOrdersDisplay();
  
  // Add event listener for place order button
  document.getElementById('place-order-btn')?.addEventListener('click', placeOrder);
  
  // Add event listener for pay order button
  document.getElementById('pay-order-btn')?.addEventListener('click', payOrder);
  
  // Add event delegation for order action buttons (since they may be dynamically shown/hidden)
  document.addEventListener('click', function(e) {
    if (e.target && e.target.id === 'cancel-order-btn') {
      cancelOrder();
    }
    
    if (e.target && e.target.id === 'remember-order-btn') {
      rememberOrder();
    }
    
    if (e.target && e.target.id === 'pay-order-btn') {
      payOrder();
    }
  });
  
  // Add event listener for save profile button
  document.getElementById('save-profile-btn')?.addEventListener('click', saveProfileForm);
  
  // Set home as active by default
  switchPage('home');
  
  // Initialize favorites and orders from localStorage
  initFavoritesPage();
  updateOrdersDisplay();
});



// Calendar functionality
let calendarInitialized = false;

function initializeCalendar() {
  const calendarContainer = document.getElementById('calendar-container');
  const calendarPopup = document.getElementById('calendar-popup');
  const currentDateInput = document.getElementById('order-date');
  const prevMonthBtn = document.getElementById('prev-month');
  const nextMonthBtn = document.getElementById('next-month');
  const currentMonthYear = document.getElementById('current-month-year');
  const calendarGrid = document.getElementById('calendar-grid');

  if (!calendarContainer || !calendarPopup || !currentDateInput || !prevMonthBtn || !nextMonthBtn || !currentMonthYear || !calendarGrid) {
    // Elements may not exist yet if the orders page hasn't been loaded
    return false;
  }

  let currentDate = new Date();
  // Set to current month by default
  currentDate.setDate(1); // Go to first day of current month
  let selectedDate = null;

  // Function to generate calendar
  function generateCalendar(date) {
    // Clear only the calendar days, keep the headers
    // Find and preserve the header elements
    const headerElements = [];
    for (let i = 0; i < 7; i++) {
      const headerElement = calendarGrid.children[i];
      if (headerElement && headerElement.classList.contains('calendar-day-header')) {
        headerElements.push(headerElement);
      }
    }
    
    // Clear only the date cells, keeping the headers
    calendarGrid.innerHTML = '';
    
    // Restore the header elements
    headerElements.forEach(header => {
      calendarGrid.appendChild(header);
    });

    // Set month and year header
    const monthNames = [
      'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
      'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
    ];
    currentMonthYear.textContent = `${monthNames[date.getMonth()]} ${date.getFullYear()}`;

    // Control visibility of navigation buttons
    const today = new Date();
    const oneMonthBack = new Date(today);
    oneMonthBack.setMonth(oneMonthBack.getMonth() - 1);
    oneMonthBack.setDate(1);
    
    const oneMonthAhead = new Date(today);
    oneMonthAhead.setMonth(oneMonthAhead.getMonth() + 1);
    oneMonthAhead.setDate(1);

    // Show/hide prev button based on whether we can go back
    if (date <= oneMonthBack) {
      prevMonthBtn.classList.add('hidden');
    } else {
      prevMonthBtn.classList.remove('hidden');
    }

    // Show/hide next button based on whether we can go forward
    if (date >= oneMonthAhead) {
      nextMonthBtn.classList.add('hidden');
    } else {
      nextMonthBtn.classList.remove('hidden');
    }

    // Get first day of month and last day of month
    const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
    const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    
    // Day of week for first day (0 = Sunday, 1 = Monday, etc.)
    const firstDayOfWeek = firstDay.getDay();
    // Adjust to make Monday the first day (0 = Monday, 6 = Sunday)
    const adjustedFirstDay = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;

    // Previous month's days
    const prevMonthLastDay = new Date(date.getFullYear(), date.getMonth(), 0).getDate();
    
    // Days from previous month to show
    for (let i = adjustedFirstDay - 1; i >= 0; i--) {
      const day = document.createElement('div');
      day.classList.add('calendar-day', 'other-month');
      day.textContent = prevMonthLastDay - i;
      calendarGrid.appendChild(day);
    }

    // Current month's days
    for (let i = 1; i <= lastDay.getDate(); i++) {
      const day = document.createElement('div');
      day.classList.add('calendar-day');
      day.textContent = i;
      
      // Check if this day is the selected date
      if (selectedDate && 
          date.getMonth() === selectedDate.getMonth() && 
          date.getFullYear() === selectedDate.getFullYear() && 
          i === selectedDate.getDate()) {
        day.classList.add('selected');
      }
      
      // Create date object for this day
      const thisDate = new Date(date.getFullYear(), date.getMonth(), i);
      
      // Disable past dates (but allow today)
      if (thisDate < new Date(today.getFullYear(), today.getMonth(), today.getDate())) {
        day.classList.add('disabled');
      } else {
        // Check if it's Sunday (Sunday = 0)
        const dayOfWeek = thisDate.getDay();
        if (dayOfWeek === 0) { // Sunday
          day.classList.add('disabled');
          day.title = 'Выбор даты невозможен (воскресенье)'; // Tooltip for disabled days
        } else {
          day.addEventListener('click', () => {
            if (!day.classList.contains('disabled')) {
              // Remove selected class from all days
              document.querySelectorAll('.calendar-day.selected').forEach(el => {
                el.classList.remove('selected');
              });
              
              // Add selected class to clicked day
              day.classList.add('selected');
              
              // Set selected date
              selectedDate = new Date(date.getFullYear(), date.getMonth(), i);
              
              // Format date as DD.MM.YYYY
              const formattedDate = `${String(i).padStart(2, '0')}.${String(date.getMonth() + 1).padStart(2, '0')}.${date.getFullYear()}`;
              
              // Update input field
              currentDateInput.value = formattedDate;
              
              // Hide calendar
              calendarPopup.classList.remove('show');
            }
          });
        }
      }
      
      calendarGrid.appendChild(day);
    }

    // Next month's days to fill the row
    const totalCells = 42; // 6 rows x 7 days
    const totalDaysShown = adjustedFirstDay + lastDay.getDate();
    const nextMonthDays = totalCells - totalDaysShown;
    
    for (let i = 1; i <= nextMonthDays; i++) {
      const day = document.createElement('div');
      day.classList.add('calendar-day', 'other-month');
      day.textContent = i;
      calendarGrid.appendChild(day);
    }
  }

  // Remove existing event listeners to avoid duplicates
  if (currentDateInput._calendarEventAdded) {
    return true; // Event listener already added
  }
  
  // Toggle calendar popup on click (instead of focus)
  currentDateInput.addEventListener('click', (e) => {
    e.stopPropagation(); // Prevent event bubbling
    calendarPopup.classList.toggle('show');
    if (calendarPopup.classList.contains('show')) {
      generateCalendar(currentDate);
    }
  });
  currentDateInput._calendarEventAdded = true;

  // Also add click event to the container for good measure
  if (!calendarContainer._calendarEventAdded) {
    calendarContainer.addEventListener('click', (e) => {
      e.stopPropagation(); // Prevent event bubbling
      calendarPopup.classList.add('show');
      if (calendarPopup.classList.contains('show')) {
        generateCalendar(currentDate);
      }
    });
    calendarContainer._calendarEventAdded = true;
  }

  // Click outside to close calendar
  if (!document._calendarOutsideEventAdded) {
    document.addEventListener('click', (e) => {
      if (!calendarContainer.contains(e.target)) {
        calendarPopup.classList.remove('show');
      }
    });
    document._calendarOutsideEventAdded = true;
  }

  // Prevent closing when clicking inside calendar popup
  if (!calendarPopup._calendarInsideEventAdded) {
    calendarPopup.addEventListener('click', (e) => {
      e.stopPropagation();
    });
    calendarPopup._calendarInsideEventAdded = true;
  }

  // Previous month button
  if (!prevMonthBtn._calendarEventAdded) {
    prevMonthBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const newDate = new Date(currentDate);
      newDate.setMonth(newDate.getMonth() - 1);
      
      // Update current date and regenerate calendar
      currentDate = newDate;
      generateCalendar(currentDate);
    });
    prevMonthBtn._calendarEventAdded = true;
  }

  // Next month button
  if (!nextMonthBtn._calendarEventAdded) {
    nextMonthBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const newDate = new Date(currentDate);
      newDate.setMonth(newDate.getMonth() + 1);
      
      // Update current date and regenerate calendar
      currentDate = newDate;
      generateCalendar(currentDate);
    });
    nextMonthBtn._calendarEventAdded = true;
  }

  // Initialize calendar
  generateCalendar(currentDate);
  return true;
}

// Initialize custom select functionality
function initializeCustomSelects() {
  // Time selection dropdown
  const timeSelectInput = document.getElementById('order-time');
  const timeDropdown = document.getElementById('time-dropdown');
  
  if (timeSelectInput && timeDropdown) {
    // Remove any existing event listeners to avoid duplicates
    if (timeSelectInput._timeSelectEventAdded) {
      // If event listeners already exist, just return
      return;
    }
    
    // Toggle dropdown when clicking on input
    timeSelectInput.addEventListener('click', (e) => {
      e.stopPropagation();
      timeDropdown.classList.toggle('show');
    });
    
    // Add event listeners to options after ensuring they exist
    setTimeout(() => {
      const timeOptions = timeDropdown.querySelectorAll('.custom-option');
      timeOptions.forEach(option => {
        option.removeEventListener('click', option._clickHandler);
        option._clickHandler = (e) => {
          e.stopPropagation();
          const value = option.getAttribute('data-value');
          const text = option.textContent;
          timeSelectInput.value = text;
          timeSelectInput.setAttribute('data-value', value);
          timeDropdown.classList.remove('show');
        };
        option.addEventListener('click', option._clickHandler);
      });
    }, 10);
    
    timeSelectInput._timeSelectEventAdded = true;
  }
  
  // Delivery selection dropdown
  const deliverySelectInput = document.getElementById('delivery-option');
  const deliveryDropdown = document.getElementById('delivery-dropdown');
  
  if (deliverySelectInput && deliveryDropdown) {
    // Remove any existing event listeners to avoid duplicates
    if (deliverySelectInput._deliverySelectEventAdded) {
      // If we're reinitializing, we still need to reattach to new elements
      // So we'll continue to setup the event handlers
    }
    
    // Toggle dropdown when clicking on input
    deliverySelectInput.addEventListener('click', (e) => {
      e.stopPropagation();
      deliveryDropdown.classList.toggle('show');
    });
    
    // Add event listeners to options after ensuring they exist
    setTimeout(() => {
      const deliveryOptions = deliveryDropdown.querySelectorAll('.custom-option');
      deliveryOptions.forEach(option => {
        option.removeEventListener('click', option._clickHandler);
        option._clickHandler = (e) => {
          e.stopPropagation();
          const value = option.getAttribute('data-value');
          const text = option.textContent;
          deliverySelectInput.value = text;
          deliverySelectInput.setAttribute('data-value', value);
          deliveryDropdown.classList.remove('show');
        };
        option.addEventListener('click', option._clickHandler);
      });
    }, 10);
    
    deliverySelectInput._deliverySelectEventAdded = true;
  }
  
  // Close dropdowns when clicking elsewhere - add only once
  if (!document._customSelectCloseEventAdded) {
    document.addEventListener('click', (e) => {
      // Time dropdown
      if (timeDropdown && !timeDropdown.contains(e.target) && !timeSelectInput.contains(e.target)) {
        timeDropdown.classList.remove('show');
      }
      
      // Delivery dropdown
      if (deliveryDropdown && !deliveryDropdown.contains(e.target) && !deliverySelectInput.contains(e.target)) {
        deliveryDropdown.classList.remove('show');
      }
    });
    document._customSelectCloseEventAdded = true;
  }
}

// Initialize calendar when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  // Try to initialize immediately
  initializeCalendar();
  // Initialize custom selects
  initializeCustomSelects();
});
