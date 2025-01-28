import React from 'react'
import TableItem from '../TableItem'
import './index.css'

class FormData extends React.Component {
  state = {
    users: [],
    filteredUsers: [],
    formData: {
      id: '',
      firstName: '',
      lastName: '',
      email: '',
      department: '',
    },
    editing: false,
    error: {
      firstName: '',
      lastName: '',
      email: '',
      department: '',
      id: '', // Error for duplicate ID
    },
    selectedRow: null,
    nextId: 1,
    searchQuery: '', // Added search query state
    apiError: '', // Error message for API
    apiSuccess: '', // Success message for API
  }

  // Fetch initial data
  componentDidMount() {
    fetch('https://jsonplaceholder.typicode.com/users') // Fetch data from an API
      .then(response => response.json())
      .then(data => {
        const mappedData = data.map(user => ({
          id: user.id,
          firstName: user.name.split(' ')[0] || '',
          lastName: user.name.split(' ')[1] || '',
          email: user.email,
          department: ['Engineering', 'Marketing', 'Finance', 'HR'][
            Math.floor(Math.random() * 4)
          ],
        }))

        const maxId = Math.max(...mappedData.map(user => user.id))
        this.setState({
          users: mappedData,
          filteredUsers: mappedData, // Initialize filteredUsers
          nextId: maxId + 1, // Set the next available ID
        })
      })
      .catch(error => console.error('Error fetching users:', error))
  }

  handleInputChange = e => {
    const {name, value} = e.target
    const {formData, error} = this.state
    this.setState({
      formData: {...formData, [name]: value},
      error: {...error, [name]: ''}, // Clear error for the field being changed
    })
  }

  handleFocus = e => {
    const {name} = e.target
    const {error} = this.state
    this.setState({
      error: {...error, [name]: ''}, // Clear error on focus
    })
  }

  handleBlur = e => {
    const {name, value} = e.target
    const {error} = this.state
    if (!value) {
      this.setState({
        error: {...error, [name]: `${name} is required`},
      })
    }
  }

  handleSearchChange = e => {
    const searchQuery = e.target.value
    this.setState({searchQuery}, this.filterUsers(searchQuery))
  }

  filterUsers = searchQuery => {
    const {users} = this.state
    const filteredUsers = users.filter(user =>
      user.firstName.toLowerCase().includes(searchQuery.toLowerCase()),
    )
    this.setState({filteredUsers})
  }

  handleRowClick = id => {
    const {selectedRow} = this.state
    this.setState({
      selectedRow: selectedRow === id ? null : id,
    })
  }

  addUser = e => {
    e.preventDefault()
    const {formData, error, users} = this.state
    const {id, firstName, lastName, email, department} = formData
    let valid = true
    const errors = {...error}

    // Basic validation for empty fields (excluding id)
    if (!firstName) {
      errors.firstName = 'First Name is required'
      valid = false
    }
    if (!lastName) {
      errors.lastName = 'Last Name is required'
      valid = false
    }
    if (!email) {
      errors.email = 'Email is required'
      valid = false
    }
    if (!department) {
      errors.department = 'Department is required'
      valid = false
    }

    // Check for duplicate ID
    if (id && users.some(user => user.id === parseInt(id))) {
      errors.id = 'ID already exists. Please choose a different ID.'
      valid = false
    }

    if (!valid) {
      this.setState({error: errors})
      return
    }

    // If id is not provided, auto-generate it
    const {nextId, filteredUsers} = this.state
    const newUser = {
      id: id ? id : nextId,
      firstName,
      lastName,
      email,
      department,
    }

    // Send POST request to API to add the user
    fetch('https://jsonplaceholder.typicode.com/users', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newUser),
    })
      .then(response => response.json())
      .then(data => {
        this.setState({
          users: [...users, newUser],
          filteredUsers: [...filteredUsers, newUser], // Update filtered users
          formData: {
            id: '',
            firstName: '',
            lastName: '',
            email: '',
            department: '',
          },
          nextId: nextId + 1,
          apiError: '', // Clear any previous error message
          apiSuccess: 'User added successfully!', // Set success message
        })
      })
      .catch(error1 => {
        this.setState({
          apiSuccess: '', // Clear any previous success message
          apiError: `Error adding user: ' + ${error1.message}`, // Set error message
        })
      })
  }

  // Edit a user (PUT request)
  updateUser = e => {
    e.preventDefault()
    const {formData, error, users, filteredUsers} = this.state
    const {id, firstName, lastName, email, department} = formData
    let valid = true
    const errors = {...error}

    // Basic validation for empty fields (excluding id)
    if (!firstName) {
      errors.firstName = 'First Name is required'
      valid = false
    }
    if (!lastName) {
      errors.lastName = 'Last Name is required'
      valid = false
    }
    if (!email) {
      errors.email = 'Email is required'
      valid = false
    }
    if (!department) {
      errors.department = 'Department is required'
      valid = false
    }

    if (!valid) {
      this.setState({error: errors})
      return
    }

    const updatedUser = {firstName, lastName, email, department}

    // Send PUT request to API to update the user
    fetch(`https://jsonplaceholder.typicode.com/users/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updatedUser), // Send updated user data
    })
      .then(response => response.json())
      .then(data => {
        // Update the local state with the new user data
        const updatedUsers = users.map(user =>
          user.id === id ? {...user, ...updatedUser} : user,
        )
        const updatedFilteredUsers = filteredUsers.map(user =>
          user.id === id ? {...user, ...updatedUser} : user,
        )

        this.setState({
          users: updatedUsers,
          filteredUsers: updatedFilteredUsers,
          formData: {
            id: '',
            firstName: '',
            lastName: '',
            email: '',
            department: '',
          },
          editing: false,
          apiError: '', // Clear any previous error message
          apiSuccess: 'User updated successfully!', // Set success message
        })
      })
      .catch(error1 => {
        this.setState({
          apiSuccess: '', // Clear any previous success message
          apiError: `Error updating user: ' + ${error1.message}`, // Set error message
        })
      })
  }

  deleteUser = id => {
    const {users, filteredUsers} = this.state
    const updatedUsers = users.filter(user => user.id !== id)
    const updatedFilteredUsers = filteredUsers.filter(user => user.id !== id)
    this.setState({
      users: updatedUsers,
      filteredUsers: updatedFilteredUsers,
      apiSuccess: 'User deleted successfully!',
      apiError: '', // Clear any previous error message
    })
  }

  resetForm = () => {
    this.setState({
      formData: {
        id: '',
        firstName: '',
        lastName: '',
        email: '',
        department: '',
      },
      editing: false,
      error: {firstName: '', lastName: '', email: '', department: '', id: ''},
      apiSuccess: '', // Clear success message on reset
      apiError: '', // Clear error message on reset
    })
  }

  // Start editing a user
  startEdit = user => {
    this.setState({
      formData: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        department: user.department,
      },
      editing: true,
      error: {firstName: '', lastName: '', email: '', department: '', id: ''},
    })
  }

  render() {
    const {
      apiError,
      apiSuccess,
      searchQuery,
      filteredUsers,
      selectedRow,
      editing,
      formData,
      error,
    } = this.state
    const {id, firstName, lastName, department, email} = formData
    return (
      <div className="container">
        <h1>User Management Dashboard</h1>

        {/* Display API Success/Failure Message */}
        {apiSuccess && <p className="success-message">{apiSuccess}</p>}
        {apiError && <p className="error-message">{apiError}</p>}

        <input
          type="text"
          className="search-box"
          value={searchQuery}
          onChange={this.handleSearchChange}
          placeholder="Search by first name"
        />

        <h2>User List</h2>
        {filteredUsers.length === 0 ? (
          <p className="no-users">
            No users available. Add a new user to get started!
          </p>
        ) : (
          <TableItem
            filteredUsers={filteredUsers}
            handleRowClick={this.handleRowClick}
            selectedRow={selectedRow}
            startEdit={this.startEdit}
            deleteUser={this.deleteUser}
          />
        )}

        <form
          onSubmit={editing ? this.updateUser : this.addUser}
          className="form"
        >
          <h2>{editing ? 'Edit User' : 'Add User'}</h2>

          {/* Form fields */}
          <label htmlFor="userId">ID </label>
          <input
            type="text"
            id="userId"
            name="id"
            value={id}
            onChange={this.handleInputChange}
            placeholder="Auto-generated if left empty"
          />
          {error.id && <p className="error">{error.id}</p>}

          <label htmlFor="userName">First Name</label>
          <input
            type="text"
            id="userName"
            name="firstName"
            value={firstName}
            onChange={this.handleInputChange}
            onFocus={this.handleFocus}
            onBlur={this.handleBlur}
          />
          {error.firstName && <p className="error">{error.firstName}</p>}

          <label htmlFor="userLastName">Last Name</label>
          <input
            type="text"
            id="userLastName"
            name="lastName"
            value={lastName}
            onChange={this.handleInputChange}
            onFocus={this.handleFocus}
            onBlur={this.handleBlur}
          />
          {error.lastName && <p className="error">{error.lastName}</p>}

          <label htmlFor="userEmail">Email</label>
          <input
            type="email"
            id="userEmail"
            name="email"
            value={email}
            onChange={this.handleInputChange}
            onFocus={this.handleFocus}
            onBlur={this.handleBlur}
          />
          {error.email && <p className="error">{error.email}</p>}

          <label htmlFor="userDept">Department</label>
          <input
            type="text"
            id="userDept"
            name="department"
            value={department}
            onChange={this.handleInputChange}
            onFocus={this.handleFocus}
            onBlur={this.handleBlur}
          />
          {error.department && <p className="error">{error.department}</p>}

          <div className="form-actions">
            <button type="submit" className="submit-btn">
              {editing ? 'Update User' : 'Add User'}
            </button>
            <button
              type="button"
              onClick={this.resetForm}
              className="cancel-btn"
            >
              {editing ? 'Cancel' : 'Reset'}
            </button>
          </div>
        </form>
      </div>
    )
  }
}

export default FormData
