import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import './Profile.css'
import {urlConfig} from '../../config';
import { useAppContext } from '../../context/AuthContext';

const Profile = () => {
    // userDetails armazena os dados atuais do utilizador (o que é exibido)
    const [userDetails, setUserDetails] = useState({ name: '', email: '' });
    // updatedDetails armazena os dados que o utilizador está a editar
    const [updatedDetails, setUpdatedDetails] = useState({ name: '', email: '' }); // Email permanece para exibição/referência
    const { setUserName } = useAppContext(); // Só precisamos de setUserName aqui para atualizar o contexto
    const [changed, setChanged] = useState(""); // Mensagem de sucesso/erro

    const [editMode, setEditMode] = useState(false);
    const navigate = useNavigate();

    // Efeito para verificar o token e carregar o perfil
    useEffect(() => {
        // Função para buscar/carregar os dados do perfil - MOVIDA PARA AQUI DENTRO
        const fetchUserProfile = () => {
            const name = sessionStorage.getItem('name');
            const email = sessionStorage.getItem('email');

            if (name && email) {
                const storedUserDetails = {
                    name: name,
                    email: email
                };
                setUserDetails(storedUserDetails);
                setUpdatedDetails(storedUserDetails); // Popula updatedDetails com os valores atuais
            } else {
                console.log("Nome ou email não encontrados na sessionStorage. Redirecionando ou tentando novamente.");
                navigate("/app/login"); // Redireciona se não houver dados essenciais
            }
        };

        const authtoken = sessionStorage.getItem("auth-token");
        if (!authtoken) {
            navigate("/app/login");
        } else {
            fetchUserProfile(); // Chama a função que agora está definida internamente
        }
    }, [navigate]); // navigate nas dependências - 'fetchUserProfile' já não é uma dependência externa

    const handleEdit = () => {
        setEditMode(true);
        // Ao entrar em modo de edição, garantir que updatedDetails reflete o userDetails atual
        setUpdatedDetails({ ...userDetails });
        setChanged(""); // Limpa mensagens anteriores
    };

    const handleCancel = () => { // Adicionar handleCancel para sair do modo de edição
        setEditMode(false);
        setUpdatedDetails({ ...userDetails }); // Volta os campos para os valores originais
        setChanged(""); // Limpa mensagens anteriores
    };

    const handleInputChange = (e) => {
        setUpdatedDetails({
            ...updatedDetails,
            [e.target.name]: e.target.value, // e.target.name será 'name' ou 'password'
        });
        setChanged(""); // Limpa a mensagem ao começar a digitar
    };

    // Função para lidar com a submissão do formulário de atualização
    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const authtoken = sessionStorage.getItem("auth-token");
            const email = sessionStorage.getItem("email"); // Email do utilizador logado para o header

            if (!authtoken || !email) {
                navigate("/app/login");
                return;
            }

            // Construir o payload para enviar ao backend
            // O backend espera 'firstName', 'lastName' e 'password'
            // O teu frontend envia 'name'. Vamos ter que dividir 'name' em 'firstName' e 'lastName'
            const [firstName, ...lastNameParts] = updatedDetails.name.split(' ');
            const lastName = lastNameParts.join(' '); // Reconstroi o lastName

            const payload = {
                firstName: firstName,
                lastName: lastName,
                // O campo 'password' será adicionado apenas se for preenchido
            };

            // Se o utilizador digitou algo no campo 'password', adiciona ao payload
            if (updatedDetails.password && updatedDetails.password !== '') {
                payload.password = updatedDetails.password;
            }

            // Se não houver alterações, não faz a chamada API
            // Compara os dados que seriam enviados com os dados atuais
            const currentFirstName = userDetails.name.split(' ')[0];
            const currentLastName = userDetails.name.split(' ').slice(1).join(' ');

            if (payload.firstName === currentFirstName &&
                payload.lastName === currentLastName &&
                !payload.password) {
                setEditMode(false);
                setChanged("Nenhuma alteração detetada.");
                setTimeout(() => setChanged(""), 2000);
                return;
            }


            const response = await fetch(`${urlConfig.backendUrl}/api/auth/update`, {
                // Task 1: set method
                method: 'PUT',
                // Task 2: set headers
                headers: {
                    "Authorization": `Bearer ${authtoken}`,
                    "Content-Type": "application/json",
                    "email": email, // Envia o email do utilizador logado no header
                },
                // Task 3: set body to send user details
                body: JSON.stringify(payload),
            });

            if (response.ok) {
                const responseData = await response.json(); // Backend retorna { authtoken, userName, userEmail }

                // Monta o nome completo atualizado a partir do userName retornado pelo backend
                // e o lastName que foi enviado (assumindo que o backend não altera lastName)
                const newFullName = `${responseData.userName} ${payload.lastName}`;

                // Task 4: set the new name in the AppContext
                setUserName(newFullName); // Atualiza o nome completo no contexto

                // Task 5: set user name in the session
                sessionStorage.setItem("auth-token", responseData.authtoken); // Atualiza o token
                sessionStorage.setItem("name", newFullName); // Atualiza o nome completo
                sessionStorage.setItem("email", responseData.userEmail); // Atualiza o email (caso o backend retorne)


                setUserDetails({ // Atualiza o estado local para exibição
                    name: newFullName,
                    email: responseData.userEmail || email, // Usa o email da resposta ou o original
                });
                setUpdatedDetails({ // Reseta os campos de edição
                    name: newFullName,
                    email: responseData.userEmail || email,
                    password: '' // Limpa o campo da password
                });
                setEditMode(false);

                // Display success message to the user
                setChanged("Perfil atualizado com sucesso!");
                setTimeout(() => {
                    setChanged("");
                    // navigate("/"); // O laboratório sugere navegar, mas é melhor ficar aqui
                }, 2000); // 2 segundos para ler a mensagem

            } else {
                // Lidar com erros da API
                const errorData = await response.json();
                const errorMessage = errorData.error || (errorData.errors && errorData.errors[0] && errorData.errors[0].msg) || "Falha ao atualizar o perfil.";
                throw new Error(errorMessage);
            }
        } catch (error) {
            console.error("Erro ao atualizar o perfil:", error);
            setChanged(`Erro: ${error.message}`); // Exibe o erro
            setTimeout(() => { setChanged(""); }, 3000);
        }
    };

    return (
        <div className="profile-container">
            {editMode ? (
                <form onSubmit={handleSubmit}>
                    <h2>Editar Perfil</h2>
                    <label>
                        Email:
                        <input
                            type="email"
                            name="email"
                            value={userDetails.email} // Exibe o email atual, desabilitado
                            disabled
                            className="form-control"
                        />
                    </label>
                    <label>
                        Nome Completo:
                        <input
                            type="text"
                            name="name" // Este campo será dividido em firstName e lastName para o backend
                            value={updatedDetails.name}
                            onChange={handleInputChange}
                            className="form-control"
                        />
                    </label>
                    {/* Adicionar campo para a password, mas sem mostrar a password atual */}
                    <label>
                        Nova Password:
                        <input
                            type="password"
                            name="password" // Nome para o handleInputChange
                            value={updatedDetails.password || ''} // Assegurar que é uma string vazia se não definida
                            onChange={handleInputChange}
                            placeholder="Deixe em branco para não alterar"
                            className="form-control"
                        />
                    </label>

                    <button type="submit" className="btn btn-primary mt-3">Guardar</button>
                    <button type="button" onClick={handleCancel} className="btn btn-secondary mt-3 ms-2">Cancelar</button> {/* Botão Cancelar */}
                </form>
            ) : (
                <div className="profile-details">
                    <h1>Olá, {userDetails.name}</h1>
                    <p> <b>Email:</b> {userDetails.email}</p>
                    <button onClick={handleEdit} className="btn btn-primary mt-3">Editar Perfil</button>
                    <span style={{ color: 'green', height: '.5cm', display: 'block', fontStyle: 'italic', fontSize: '12px' }}>{changed}</span>
                </div>
            )}
        </div>
    );
};

export default Profile;