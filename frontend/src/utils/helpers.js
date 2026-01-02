// A simple toast notification using DOM manipulation (works with existing CSS)
export function showAlert(message, type = 'info') {
  const alertDiv = document.createElement('div');
  alertDiv.className = `alert alert-${type}`;
  alertDiv.style.position = 'fixed';
  alertDiv.style.top = '20px';
  alertDiv.style.right = '20px';
  alertDiv.style.zIndex = '1000';
  alertDiv.style.minWidth = '300px';
  
  alertDiv.innerHTML = `
    <i class="fas fa-${type === 'error' ? 'exclamation-circle' : 'check-circle'}"></i>
    <span>${message}</span>
  `;
  
  document.body.appendChild(alertDiv);

  // Fade out and remove
  setTimeout(() => {
    alertDiv.style.transition = 'opacity 0.5s ease';
    alertDiv.style.opacity = '0';
    setTimeout(() => alertDiv.remove(), 500);
  }, 4000);
}

export function formatDate(dateString) {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleString();
}

export function getDeviceIcon(deviceType) {
  switch (deviceType?.toLowerCase()) {
    case 'mobile':
      return 'fa-mobile-alt';
    case 'tablet':
      return 'fa-tablet-alt';
    default:
      return 'fa-laptop';
  }
}