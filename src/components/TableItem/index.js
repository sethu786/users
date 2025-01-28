import './index.css' // Assuming you have a CSS file for the table

const UserTable = props => {
  const {filteredUsers, handleRowClick, selectedRow, startEdit, deleteUser} =
    props
  return (
    <div className="table-container">
      <table className="user-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>First Name</th>
            <th>Last Name</th>
            <th>Email</th>
            <th>Department</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredUsers.map(user => (
            <tr
              key={user.id}
              className={selectedRow === user.id ? 'selected-row' : ''}
              onClick={() => handleRowClick(user.id)} // Clicking on row
            >
              <td>{user.id}</td>
              <td>{user.firstName}</td>
              <td>{user.lastName}</td>
              <td>{user.email}</td>
              <td>{user.department}</td>
              <td>
                <button
                  type="button"
                  className="edit-btn"
                  onClick={e => startEdit(user, e)} // Edit button
                >
                  Edit
                </button>
                <button
                  type="button"
                  className="delete-btn"
                  onClick={e => deleteUser(user.id, e)} // Delete button
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default UserTable
