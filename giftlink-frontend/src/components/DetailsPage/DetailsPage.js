// CÓDIGO SUGERIDO PARA O TEU src/components/DetailsPage/DetailsPage.js (Completo e Corrigido)
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { urlConfig } from '../../config'; // Importa urlConfig
import './DetailsPage.css';

function DetailsPage() {
    const navigate = useNavigate();
    const { productId } = useParams();
    const [gift, setGift] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const authenticationToken = sessionStorage.getItem('authToken'); // Usar 'authToken' conforme os hints anteriores e a prática comum
        if (!authenticationToken) {
            navigate('/app/login');
            return;
        }

        const fetchGift = async () => {
            try {
                const response = await fetch(`${urlConfig.backendUrl}/api/gifts/${productId}`);
                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({ message: `HTTP error; ${response.status}` }));
                    throw new Error(errorData.message || `HTTP error; ${response.status}`);
                }
                const data = await response.json();
                setGift(data);
            } catch (error) {
                console.error("Fetch error:", error);
                setError(error);
            } finally {
                setLoading(false);
            }
        };

        fetchGift();
        window.scrollTo(0, 0); // Scroll to top on component mount
    }, [productId, navigate]);

    const handleBackClick = () => {
        navigate(-1);
    };

    // Helper functions for formatting (from previous solution)
    const formatDate = (timestamp) => {
        if (!timestamp) return 'N/A';
        const date = new Date(timestamp * 1000);
        return date.toLocaleString('default', { month: 'long', day: 'numeric', year: 'numeric' });
    };

    const getConditionClass = (condition) => {
        if (!condition) return '';
        return condition === "New" ? "list-group-item-success" : "list-group-item-warning";
    };

    // Use comments from gift object if available, otherwise use hardcoded
    const hardcodedComments = [
        { author: "John Doe", comment: "I would like this!" },
        { author: "Jane Smith", comment: "Just DMed you." },
        { author: "Alice Johnson", comment: "I will take it if it's still available." },
        { author: "Mike Brown", comment: "This is a good one!" },
        { author: "Sarah Wilson", comment: "My family can use one. DM me if it is still available. Thank you!" }
    ];
    const displayComments = gift?.comments && gift.comments.length > 0 ? gift.comments : hardcodedComments;


    if (loading) return <div className="container mt-5">Loading gift details...</div>;
    if (error) return <div className="container mt-5">Error: {error.message || error}</div>;
    if (!gift) return <div className="container mt-5">Gift not found or data is unavailable.</div>;

    return (
        <div className="container mt-5">
            <button className="btn btn-secondary mb-3" onClick={handleBackClick}>Back to all gifts</button>
            <div className="card product-details-card">
                <div className="row g-0">
                    <div className="col-md-6">
                        <div className="image-placeholder-large d-flex align-items-center justify-content-center bg-light text-muted" style={{ height: '300px' }}>
                            {gift.image ? (
                                <img src={`${urlConfig.backendUrl}${gift.image}`} alt={gift.name} className="img-fluid rounded-start product-image-large" />
                            ) : (
                                <div className="no-image-available-large">No Image Available</div>
                            )}
                        </div>
                    </div>
                    <div className="col-md-6">
                        <div className="card-body">
                            <h2 className="details-title">{gift.name}</h2>
                            <p><strong>Category:</strong> {gift.category || 'N/A'}</p>
                            <p className={getConditionClass(gift.condition)}><strong>Condition:</strong> {gift.condition || 'N/A'}</p>
                            <p><strong>Date Added:</strong> {formatDate(gift.date_added)}</p>
                            <p><strong>Age:</strong> {gift.age_years !== undefined ? `${gift.age_years} years` : 'N/A'} ({gift.age_days !== undefined ? `${gift.age_days} days` : 'N/A'})</p>
                            <hr />
                            <p><strong>Description:</strong> {gift.description || 'No description provided.'}</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="comments-section mt-4">
                <h3 className="mb-3">Comments</h3>
                {displayComments.length > 0 ? (
                    displayComments.map((comment, index) => (
                        <div key={index} className="card mb-3">
                            <div className="card-body">
                                <p className="comment-author"><strong>{comment.user || comment.author}:</strong></p>
                                <p className="comment-text">{comment.text || comment.comment}</p>
                            </div>
                        </div>
                    ))
                ) : (
                    <p>No comments yet. Be the first to comment!</p>
                )}
            </div>
        </div>
    );
}

export default DetailsPage;