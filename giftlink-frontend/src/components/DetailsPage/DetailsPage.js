import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { urlConfig } from '../../config'; // Importa urlConfig
import './DetailsPage.css'; // Assumo que este ficheiro CSS será criado/estilizado mais tarde, se necessário.

function DetailsPage() {
    const navigate = useNavigate();
    const { productId } = useParams();
    const [gift, setGift] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        // Task 1: Check for authentication and redirect
        const authenticationToken = sessionStorage.getItem('authToken'); // O hint anterior mencionava 'authToken', não 'auth-token'
        if (!authenticationToken) {
            navigate('/app/login');
            return;
        }

        // get the gift to be rendered on the details page
        const fetchGift = async () => {
            try {
                // Task 2: Fetch gift details
                // Hint: const response = await fetch(`<span class="math-inline">\{urlConfig\.backendUrl\}/api/gifts/</span>{productId}`);
                const response = await fetch(`<span class="math-inline">\{urlConfig\.backendUrl\}/api/gifts/</span>{productId}`);
                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({ message: 'Failed to parse error message' }));
                    throw new Error(errorData.message || 'Network response was not ok');
                }
                const data = await response.json();
                setGift(data);
            } catch (error) {
                console.error("Fetch error:", error); // Adiciona log para depuração
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchGift();

        // Task 3: Scroll to top on component mount
        // Hint: window.scrollTo(0, 0);
        window.scrollTo(0, 0);

    }, [productId, navigate]); // Dependências: productId para refetch se mudar, navigate para redirecionar

    const handleBackClick = () => {
        // Task 4: Handle back click
        // Hint: navigate(-1);
        navigate(-1);
    };

    // Helper function to format date
    const formatDate = (timestamp) => {
        if (!timestamp) return 'N/A';
        const date = new Date(timestamp * 1000); // MongoDB timestamps are usually in seconds
        return date.toLocaleString('default', { month: 'long', day: 'numeric', year: 'numeric' });
    };

    // Helper function to get condition class
    const getConditionClass = (condition) => {
        if (!condition) return '';
        return condition === "New" ? "list-group-item-success" : "list-group-item-warning";
    };


    //The comments have been hardcoded for this project. (Isto será substituído pelos comentários reais do 'gift' objecto)
    // A tua tarefa pedia para renderizar os comentários da 'comments' array no 'gift' objecto.
    // A hardcoded 'comments' array acima pode ser removida se os dados da API vierem com comentários.
    // Se a API não vier com comentários, então podes manter a hardcoded 'comments' array para demonstração.
    // Para seguir a tarefa, vamos usar 'gift.comments' se existir, ou a hardcoded array se 'gift.comments' for null/empty.
    const displayComments = gift?.comments && gift.comments.length > 0 ? gift.comments : [
        { author: "John Doe", comment: "I would like this!" },
        { author: "Jane Smith", comment: "Just DMed you." },
        { author: "Alice Johnson", comment: "I will take it if it's still available." },
        { author: "Mike Brown", comment: "This is a good one!" },
        { author: "Sarah Wilson", comment: "My family can use one. DM me if it is still available. Thank you!" }
    ];

    if (loading) return <div className="container mt-5">Loading gift details...</div>;
    if (error) return <div className="container mt-5">Error: {error}</div>;
    if (!gift) return <div className="container mt-5">Gift not found or data is unavailable.</div>;


    return (
        <div className="container mt-5">
            <button className="btn btn-secondary mb-3" onClick={handleBackClick}>Back to all gifts</button>
            <div className="card product-details-card">
                <div className="row g-0"> {/* Usado g-0 para remover gutters, comum no Bootstrap 5 */}
                    <div className="col-md-6">
                        <div className="image-placeholder-large d-flex align-items-center justify-content-center bg-light text-muted" style={{ height: '300px' }}>
                            {/* Task 5: Display gift image */}
                            {gift.image ? (
                                // Hint: <img src={gift.image} alt={gift.name} className="product-image-large" />
                                // Lembra-te que precisamos do URL do backend para a imagem:
                                <img src={`<span class="math-inline">\{urlConfig\.backendUrl\}</span>{gift.image}`} alt={gift.name} className="img-fluid rounded-start product-image-large" />
                            ) : (
                                <div className="no-image-available-large">No Image Available</div>
                            )}
                        </div>
                    </div>
                    <div className="col-md-6">
                        <div className="card-body">
                            <h2 className="details-title">{gift.name}</h2>
                            {/* Task 6: Display gift details */}
                            <p><strong>Category:</strong> {gift.category || 'N/A'}</p>
                            <p className={getConditionClass(gift.condition)}><strong>Condition:</strong> {gift.condition || 'N/A'}</p>
                            <p><strong>Date Added:</strong> {formatDate(gift.date_added)}</p>
                            <p><strong>Age (Years):</strong> {gift.age_years !== undefined ? gift.age_years : 'N/A'}</p>
                            <p><strong>Description:</strong> {gift.description || 'No description provided.'}</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="comments-section mt-4">
                <h3 className="mb-3">Comments</h3>
                {/* Task 7: Render comments section by using the map function to go through all the comments */}
                {displayComments.length > 0 ? (
                    displayComments.map((comment, index) => (
                        <div key={index} className="card mb-3">
                            <div className="card-body">
                                <p className="comment-author"><strong>{comment.user || comment.author}:</strong></p> {/* Usamos 'user' ou 'author' dependendo de como vêm da API ou do hardcoded */}
                                <p className="comment-text">{comment.text || comment.comment}</p> {/* Usamos 'text' ou 'comment' */}
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