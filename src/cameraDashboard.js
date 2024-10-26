import React, { useEffect, useState } from 'react';
import axios from 'axios';
import ReactPaginate from 'react-paginate';
import './CameraDashboard.css';

const CameraDashboard = () => {
  const [cameras, setCameras] = useState([]);
  const [filteredCameras, setFilteredCameras] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [perPage] = useState(10);

  const token = '4ApVMIn5sTxeW7GQ5VWeWiy';

  useEffect(() => {
    fetchCameras();
  }, []);

  const fetchCameras = async () => {
    try {
      const response = await axios.get('https://api-app-staging.wobot.ai/app/v1/fetch/cameras', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setCameras(response.data.data);
      setFilteredCameras(response.data.data);
    } catch (error) {
      console.error('Error fetching camera data:', error);
    }
  };

  const handleSearch = (e) => {
    const searchValue = e.target.value.toLowerCase();
    setSearchTerm(searchValue);
    filterCameras(searchValue, statusFilter, locationFilter);
  };

  const handleFilterStatus = (e) => {
    const statusValue = e.target.value;
    setStatusFilter(statusValue);
    filterCameras(searchTerm, statusValue, locationFilter);
  };

  const handleFilterLocation = (e) => {
    const locationValue = e.target.value;
    setLocationFilter(locationValue);
    filterCameras(searchTerm, statusFilter, locationValue);
  };

  const filterCameras = (search, status, location) => {
    let filtered = cameras;

    if (search) {
      filtered = filtered.filter((camera) =>
        camera.name.toLowerCase().includes(search) ||
        camera.location.toLowerCase().includes(search)
      );
    }

    if (status) {
      filtered = filtered.filter((camera) => camera.status === status);
    }

    if (location) {
      filtered = filtered.filter((camera) => camera.location === location);
    }

    setFilteredCameras(filtered);
    setCurrentPage(0); // Reset to first page after filtering
  };

  const handlePageClick = (data) => {
    setCurrentPage(data.selected);
  };

  const handleStatusUpdate = async (id, status) => {
    try {
      await axios.put(
        'https://api-app-staging.wobot.ai/app/v1/update/camera/status',
        { id, status },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      fetchCameras(); // Refresh after update
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const offset = currentPage * perPage;
  const currentCameras = filteredCameras.slice(offset, offset + perPage);

  return (
    <div className="camera-dashboard">
      <h1>Cameras</h1>
      <div className="filters">
        <input
          type="text"
          placeholder="Search by Name or Location"
          value={searchTerm}
          onChange={handleSearch}
          className="search-input"
        />
        <select onChange={handleFilterStatus} value={statusFilter} className="filter-select">
          <option value="">All Statuses</option>
          <option value="Active">Active</option>
          <option value="Inactive">Inactive</option>
        </select>
        <select onChange={handleFilterLocation} value={locationFilter} className="filter-select">
          <option value="">All Locations</option>
          {Array.from(new Set(cameras.map((camera) => camera.location)))
            .filter((location) => location)
            .map((location, index) => (
              <option key={index} value={location}>
                {location}
              </option>
            ))}
        </select>
      </div>
      <table className="camera-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Health</th>
            <th>Location</th>
            <th>Recorder</th>
            <th>Tasks</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {currentCameras.map((camera) => (
            <tr key={camera.id}>
              <td>{camera.name}</td>
              <td>
                {camera.health && (
                  <>
                    <span>Cloud: {camera.health.cloud}</span>
                    <br />
                    <span>Device: {camera.health.device}</span>
                  </>
                )}
              </td>
              <td>{camera.location}</td>
              <td>{camera.recorder || 'N/A'}</td>
              <td>{camera.tasks || 'N/A'}</td>
              <td>{camera.status}</td>
              <td>
                <button
                  onClick={() =>
                    handleStatusUpdate(camera.id, camera.status === 'Active' ? 'Inactive' : 'Active')
                  }
                >
                  {camera.status === 'Active' ? 'Deactivate' : 'Activate'}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <ReactPaginate
        previousLabel={'Previous'}
        nextLabel={'Next'}
        breakLabel={'...'}
        pageCount={Math.ceil(filteredCameras.length / perPage)}
        marginPagesDisplayed={2}
        pageRangeDisplayed={5}
        onPageChange={handlePageClick}
        containerClassName={'pagination'}
        activeClassName={'active'}
        previousClassName={'page-item'}
        nextClassName={'page-item'}
        pageClassName={'page-item'}
        breakClassName={'page-item'}
        disabledClassName={'disabled'}
      />
    </div>
  );
};

export default CameraDashboard;
