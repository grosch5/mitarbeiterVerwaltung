let employees = JSON.parse(localStorage.getItem('employees')) || [];
let selectedEmployeeId = null;
let editingShiftId = null;
let filteredEmployees = [];

document.addEventListener('DOMContentLoaded', function() {
    renderEmployees();
    setupEventListeners();
});

function setupEventListeners() {
    // add Employee
    document.getElementById('addEmployeeBtn').addEventListener('click', showAddEmployeeModal);
    
    // save Employee
    document.getElementById('saveEmployeeBtn').addEventListener('click', saveEmployee);
    
    // cancel editing
    document.getElementById('cancelEditBtn').addEventListener('click', cancelEdit);
    
    document.querySelectorAll('.tab').forEach(tab => {
        tab.addEventListener('click', function() {
            switchTab(this.dataset.tab);
        });
    });
    
    // add shift
    document.getElementById('addShiftBtn').addEventListener('click', showAddShiftModal);
    
    // shift form
    document.getElementById('shiftForm').addEventListener('submit', saveShift);
    
    document.querySelector('.close-modal').addEventListener('click', closeModal);
    document.getElementById('cancelShiftBtn').addEventListener('click', closeModal);
    
    // search function
    document.getElementById('employeeSearch').addEventListener('input', searchEmployees);
    document.getElementById('employeeSearch').addEventListener('keydown', handleSearchKeydown);
}

function renderEmployees() {
    const container = document.getElementById('employeesContainer');
    const searchTerm = document.getElementById('employeeSearch').value.toLowerCase().trim();
    const employeesToRender = searchTerm ? filteredEmployees : employees;
    
    if (employeesToRender.length === 0) {
        if (searchTerm) {
            container.innerHTML = '<div class="no-results">Keine Mitarbeiter gefunden für "' + searchTerm + '"</div>';
        } else {
            container.innerHTML = '<div class="no-data">Keine Mitarbeiter vorhanden</div>';
        }
        return;
    }
    
    container.innerHTML = '';
    
    employeesToRender.forEach(employee => {
        const employeeElement = document.createElement('div');
        employeeElement.className = `employee-item ${selectedEmployeeId === employee.id ? 'active' : ''}`;
        employeeElement.dataset.id = employee.id;
        
        if (searchTerm) {
            employeeElement.classList.add('highlight');
        }
        
        employeeElement.innerHTML = `
            <div class="employee-info">
                <h3>${highlightSearchTerm(employee.name, searchTerm)}</h3>
                <div class="employee-role">${highlightSearchTerm(employee.role, searchTerm)}</div>
            </div>
            <div class="employee-status ${employee.status === 'active' ? 'status-active' : 'status-inactive'}">
                ${employee.status === 'active' ? 'Aktiv' : 'Inaktiv'}
            </div>
        `;
        
        employeeElement.addEventListener('click', () => selectEmployee(employee.id));
        container.appendChild(employeeElement);
    });
}

// Searchfunction
function searchEmployees() {
    const searchTerm = document.getElementById('employeeSearch').value.toLowerCase().trim();
    
    if (searchTerm === '') {
        // if searchbar is empty show normal employee lisz
        filteredEmployees = [];
        renderEmployees();
        return;
    }
    
    // filter employee
    filteredEmployees = employees.filter(employee => 
        employee.name.toLowerCase().includes(searchTerm) ||
        employee.role.toLowerCase().includes(searchTerm)
    );
    
    renderEmployees();
}

// Keyboard navigation for searchterms
function handleSearchKeydown(e) {
    if (e.key === 'Escape') {
        document.getElementById('employeeSearch').value = '';
        searchEmployees();
    }
}

// highlighting text for search terms
function highlightSearchTerm(text, searchTerm) {
    if (!searchTerm) return text;
    
    const regex = new RegExp(`(${escapeRegex(searchTerm)})`, 'gi');
    return text.replace(regex, '<mark class="search-highlight">$1</mark>');
}

// escaping special characters in search terms
function escapeRegex(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

//select employee
function selectEmployee(id) {
    selectedEmployeeId = id;
    renderEmployees();
    
    const employee = employees.find(emp => emp.id === id);
    if (!employee) return;
    
    document.getElementById('noEmployeeSelected').style.display = 'none';
    document.getElementById('employeeDetails').style.display = 'block';
    
    document.getElementById('employeeName').textContent = employee.name;
    document.getElementById('editName').value = employee.name;
    document.getElementById('editRole').value = employee.role;
    document.getElementById('editStatus').value = employee.status;
    
    renderShifts();
}

function renderShifts() {
    const container = document.getElementById('shiftsContainer');
    const employee = employees.find(emp => emp.id === selectedEmployeeId);
    
    if (!employee || !employee.shifts || employee.shifts.length === 0) {
        container.innerHTML = '<div class="no-data">Keine Schichten vorhanden</div>';
        return;
    }
    
    container.innerHTML = '';
    
    employee.shifts.forEach(shift => {
        const shiftElement = document.createElement('div');
        shiftElement.className = 'shift-item';
        //calculating worktime 
        const startTime = new Date(shift.start);
        const endTime = new Date(shift.end);
        const duration = (endTime - startTime) / (1000 * 60 * 60); // 
        
        shiftElement.innerHTML = `
            <div class="shift-info">
                <div><strong>${formatDate(startTime)}</strong></div>
                <div>${formatTime(startTime)} - ${formatTime(endTime)} (${duration.toFixed(1)}h)</div>
            </div>
            <div class="shift-actions">
                <button class="btn btn-secondary edit-shift" data-id="${shift.id}">Bearbeiten</button>
                <button class="btn btn-danger delete-shift" data-id="${shift.id}">Löschen</button>
            </div>
        `;
        
        container.appendChild(shiftElement);
    });
    
    // Event Listener for shift actions
    document.querySelectorAll('.edit-shift').forEach(btn => {
        btn.addEventListener('click', function() {
            editShift(this.dataset.id);
        });
    });
    
    document.querySelectorAll('.delete-shift').forEach(btn => {
        btn.addEventListener('click', function() {
            deleteShift(this.dataset.id);
        });
    });
}

function switchTab(tabName) {
    document.querySelectorAll('.tab').forEach(tab => {
        tab.classList.remove('active');
    });
    
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    
    document.querySelector(`.tab[data-tab="${tabName}"]`).classList.add('active');
    document.getElementById(`${tabName}Tab`).classList.add('active');
}

function showAddEmployeeModal() {
    selectedEmployeeId = null;
    document.getElementById('noEmployeeSelected').style.display = 'none';
    document.getElementById('employeeDetails').style.display = 'block';
    
    document.getElementById('employeeName').textContent = 'Neue/r Mitarbeiter/in';
    document.getElementById('editName').value = '';
    document.getElementById('editRole').value = '';
    document.getElementById('editStatus').value = 'active';
    
    switchTab('info');
}

//save employee
function saveEmployee() {
    const name = document.getElementById('editName').value.trim();
    const role = document.getElementById('editRole').value.trim();
    const status = document.getElementById('editStatus').value;
    
    if (!name || !role) {
        alert('Bitte füllen Sie alle Pflichtfelder aus.');//warning 
        return;
    }
    
    if (selectedEmployeeId) {
        // if employee is already in employeelist
        const employeeIndex = employees.findIndex(emp => emp.id === selectedEmployeeId);
        if (employeeIndex !== -1) {
            employees[employeeIndex].name = name;
            employees[employeeIndex].role = role;
            employees[employeeIndex].status = status;
        }
    } else {
        // else adding new employee
        const newEmployee = {
            id: Date.now().toString(),
            name,
            role,
            status,
            shifts: []
        };
        employees.push(newEmployee);
        selectedEmployeeId = newEmployee.id;
    }
    //saving employee
    saveToLocalStorage();
    renderEmployees();
    selectEmployee(selectedEmployeeId);
    
    showMessage('Mitarbeiter erfolgreich gespeichert.', 'success'); //success message
}

function cancelEdit() {
    if (selectedEmployeeId) {
        selectEmployee(selectedEmployeeId);
    } else {
        document.getElementById('noEmployeeSelected').style.display = 'block';
        document.getElementById('employeeDetails').style.display = 'none';
    }
}

function showAddShiftModal() {
    editingShiftId = null;
    document.getElementById('shiftModalTitle').textContent = 'Neue Schicht';
    document.getElementById('shiftForm').reset();
    document.getElementById('shiftModal').style.display = 'flex';
}

function editShift(shiftId) {
    const employee = employees.find(emp => emp.id === selectedEmployeeId);
    if (!employee) return;
    
    const shift = employee.shifts.find(s => s.id === shiftId);
    if (!shift) return;
    
    editingShiftId = shiftId;
    
    const startDate = new Date(shift.start);
    const endDate = new Date(shift.end);
    
    document.getElementById('shiftModalTitle').textContent = 'Schicht bearbeiten';
    document.getElementById('shiftDate').value = formatDateForInput(startDate);
    document.getElementById('shiftStart').value = formatTimeForInput(startDate);
    document.getElementById('shiftEnd').value = formatTimeForInput(endDate);
    
    document.getElementById('shiftModal').style.display = 'flex';
}

function saveShift(e) {
    e.preventDefault();
    
    const date = document.getElementById('shiftDate').value;
    const startTime = document.getElementById('shiftStart').value;
    const endTime = document.getElementById('shiftEnd').value;
    
    if (!date || !startTime || !endTime) {
        alert('Bitte füllen Sie alle Pflichtfelder aus.');
        return;
    }
    
    const startDateTime = new Date(`${date}T${startTime}`);
    const endDateTime = new Date(`${date}T${endTime}`);
    
    if (endDateTime <= startDateTime) {
        alert('Die Endzeit muss nach der Startzeit liegen.');
        return;
    }
    
    const employeeIndex = employees.findIndex(emp => emp.id === selectedEmployeeId);
    if (employeeIndex === -1) return;
    
    if (editingShiftId) {
        const shiftIndex = employees[employeeIndex].shifts.findIndex(s => s.id === editingShiftId);
        if (shiftIndex !== -1) {
            employees[employeeIndex].shifts[shiftIndex] = {
                id: editingShiftId,
                start: startDateTime.toISOString(),
                end: endDateTime.toISOString()
            };
        }
    } else {
        const newShift = {
            id: Date.now().toString(),
            start: startDateTime.toISOString(),
            end: endDateTime.toISOString()
        };
        employees[employeeIndex].shifts.push(newShift);
    }
    
    saveToLocalStorage();
    renderShifts();
    closeModal();
    
    showMessage('Schicht erfolgreich gespeichert.', 'success'); // success message
}

//deeting shifts
function deleteShift(shiftId) {
    if (!confirm('Möchten Sie diese Schicht wirklich löschen?')) return;
    
    const employeeIndex = employees.findIndex(emp => emp.id === selectedEmployeeId);
    if (employeeIndex === -1) return;
    
    employees[employeeIndex].shifts = employees[employeeIndex].shifts.filter(s => s.id !== shiftId);
    
    saveToLocalStorage();
    renderShifts();
    
    showMessage('Schicht erfolgreich gelöscht.', 'success'); //success message
}

function closeModal() {
    document.getElementById('shiftModal').style.display = 'none';
    editingShiftId = null;
}

function saveToLocalStorage() {
    localStorage.setItem('employees', JSON.stringify(employees));
}

function formatDate(date) { //function for formating date
    return date.toLocaleDateString('de-DE', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
}

function formatTime(date) { //function for formating time
    return date.toLocaleTimeString('de-DE', {
        hour: '2-digit',
        minute: '2-digit'
    });
}

function formatDateForInput(date) {
    return date.toISOString().split('T')[0];
}

function formatTimeForInput(date) {
    return date.toTimeString().slice(0, 5);
}

function showMessage(message, type) {
    alert(message);
}