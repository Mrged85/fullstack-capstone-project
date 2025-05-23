import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import { urlConfig } from '../../config';

function SearchPage() {
    // Task 1: Define state variables for the search query, age range, and search results.
    const [searchQuery, setSearchQuery] = useState('');
    const [ageRange, setAgeRange] = useState(6); // Initialize with minimum value
    const [searchResults, setSearchResults] = useState([]);

    const categories = ['Living', 'Bedroom', 'Bathroom', 'Kitchen', 'Office', "Electronics", "Home Decor", "Books", "Furniture", "Sports", "Toys", "Office Furniture"]; // Adicionei as categorias mais completas
    const conditions = ['New', 'Like New', 'Older', "Used"]; // Adicionei "Used" para completar

    const navigate = useNavigate();

    // Remova o useEffect que está a fazer fetch de todos os produtos
    // Ele não é necessário na SearchPage, pois a pesquisa será feita com handleSearch
    /*
    useEffect(() => {
        const fetchProducts = async () => {
            try {
                let url = `${urlConfig.backendUrl}/api/gifts`
                console.log(url)
                const response = await fetch(url);
                if (!response.ok) {
                    throw new Error(`HTTP error; ${response.status}`)
                }
                const data = await response.json();
                setSearchResults(data);
            } catch (error) {
                console.log('Fetch error: ' + error.message);
            }
        };
        fetchProducts();
    }, []);
    */

    // Task 2: Fetch search results from the API based on user inputs.
    const handleSearch = async () => {
        const baseUrl = `${urlConfig.backendUrl}/api/search?`;
        const category = document.getElementById('categorySelect').value;
        const condition = document.getElementById('conditionSelect').value;

        const queryParams = new URLSearchParams({
            name: searchQuery,
            age_years: ageRange,
            category: category, // Já lida com "" para "All"
            condition: condition, // Já lida com "" para "All"
        }).toString();

        try {
            const response = await fetch(`${baseUrl}${queryParams}`);
            if (!response.ok) {
                throw new Error('Search failed');
            }
            const data = await response.json();
            // Correção da URL da imagem para os resultados da pesquisa
            const updatedData = data.map(gift => ({
                ...gift,
                image: `${urlConfig.imageUrl}${gift.image}` // Garante a URL completa da imagem
            }));
            setSearchResults(updatedData);
        } catch (error) {
            console.error('Failed to fetch search results:', error);
        }
    };

    // Task 6: Enable navigation to the details page of a selected gift.
    const goToDetailsPage = (productId) => {
        navigate(`/app/product/${productId}`);
    };

    return (
        <div className="container mt-5">
            <h2 className="mb-4">Search Gifts</h2>
            <div className="row justify-content-center">
                <div className="col-md-6">
                    <div className="filter-section mb-3 p-3 border rounded">
                        <h5>Filters</h5>
                        <div className="d-flex flex-column">
                            {/* Task 7: Add text input field for search criteria */}
                            <div className="form-group mb-3">
                                <label htmlFor="searchQuery">Search by Name</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    id="searchQuery"
                                    placeholder="Enter gift name"
                                    value={searchQuery}
                                    onChange={e => setSearchQuery(e.target.value)}
                                />
                            </div>

                            {/* Task 3: Dynamically generate category and condition dropdown options. */}
                            <div className="form-group mb-3">
                                <label htmlFor="categorySelect">Category</label>
                                <select id="categorySelect" className="form-control">
                                    <option value="">All</option>
                                    {categories.map(category => (
                                        <option key={category} value={category}>{category}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group mb-3">
                                <label htmlFor="conditionSelect">Condition</label>
                                <select id="conditionSelect" className="form-control">
                                    <option value="">All</option>
                                    {conditions.map(condition => (
                                        <option key={condition} value={condition}>{condition}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Task 4: Implement an age range slider and display the selected value. */}
                            <div className="form-group mb-3">
                                <label htmlFor="ageRange">Less than {ageRange} years</label>
                                <input
                                    type="range"
                                    className="form-control-range"
                                    id="ageRange"
                                    min="1"
                                    max="10"
                                    value={ageRange}
                                    onChange={e => setAgeRange(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Task 8: Implement search button with onClick event to trigger search: */}
                    <button onClick={handleSearch} className="btn btn-primary w-100 mb-4">
                        Search
                    </button>

                    {/* Task 5: Display search results and handle empty results with a message. */}
                    <div className="search-results mt-4">
                        {searchResults.length > 0 ? (
                            searchResults.map(product => (
                                <div key={product.id} className="card mb-3 product-card">
                                    {/* Check if product has an image and display it */}
                                    <div className="image-placeholder">
                                        {product.image ? (
                                            <img src={product.image} alt={product.name} className="card-img-top" />
                                        ) : (
                                            <div className="no-image-available">No Image Available</div>
                                        )}
                                    </div>
                                    <div className="card-body">
                                        <h5 className="card-title">{product.name}</h5>
                                        {/* Certifica-te de que description existe antes de chamar slice */}
                                        <p className="card-text">
                                            {product.description ? product.description.slice(0, 100) + '...' : 'No description available.'}
                                        </p>
                                    </div>
                                    <div className="card-footer">
                                        <button onClick={() => goToDetailsPage(product.id)} className="btn btn-primary w-100">
                                            View Details
                                        </button>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="alert alert-info" role="alert">
                                No products found. Please revise your filters.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default SearchPage;