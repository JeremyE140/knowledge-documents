import React, { useEffect, useState } from 'react';
import {Box, Button, Stack} from "@mui/material";
import { useNavigate } from 'react-router-dom';
import AddFormDialog from "../components/AddFormDialog.jsx";
import ResourcesTable from "../components/ResourcesTable.jsx";
import AddIcon from "@mui/icons-material/Add";
import axios from "axios";
import './Home.css';
import './Admin.css';

// Create rows from data
function createData(id, name, type, keywords) {
    return { id, name, type, keywords };
}

// Fetch all resources (backend)
const fetchResources = async () => {
    try {
        const response = await axios.get(`${import.meta.env.VITE_BACKEND_API_URL}/api/documents/admin/all`);
        return response.data.map(resource =>
            createData(
                resource.id,
                resource.name,
                resource.type,
                resource.keywords
            )
        );
    } catch (error) {
        console.error("Error fetching resources:", error);
    }
}

function AdminPage() {
    const [openDialog, setOpenDialog] = useState(false);
    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    // Action when page is loaded
    useEffect(() => {
    
        document.body.classList.add('admin-page-active');

        const loadResources = async () => {
            try {
                const data = await fetchResources();
                setRows(data);
            } catch (err) {
                console.error("Error fetching resources:", err);
            } finally {
                setLoading(false);
            }
        };

        loadResources();

    
        return () => {
            document.body.classList.remove('admin-page-active');
        };
    }, []);

        return (
                <>
                    {/* Navigation (kept simple, matches Home visual) */}
                    <nav className="navbar">
                        <div className="logo" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
                            <div className="logo-icon-wrapper">
                                <img src="/ensight.png" alt="Ensight" className="logo-icon-img" />
                            </div>
                            <span className="logo-text">Ensight</span>
                        </div>
                    </nav>

                    <div className="app">
                        <main className="hero">
                            <div className="glow-effect" aria-hidden="true"></div>

                            <h1 className="hero-title">Gestion des ressources</h1>

                            {/* control row - styled similarly to role buttons */}
                            <div className="role-buttons" style={{ marginTop: '1.5rem', marginBottom: '2rem' }}>
                                <button className="role-btn admin-btn" onClick={() => setOpenDialog(true)}>
                                    <span style={{display: 'inline-flex', alignItems: 'center', gap: '0.5rem'}}>
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                                        Ajouter
                                    </span>
                                </button>
                            </div>

                            <div className="admin-content" style={{ width: '100%', maxWidth: '1200px' }}>
                                <AddFormDialog
                                    open={openDialog}
                                    onClose={() => setOpenDialog(false)}
                                />

                                {loading ? (
                                    <p className="admin-loading">Chargement des ressources...</p>
                                ) : (
                                    <ResourcesTable rows={rows} />
                                )}
                            </div>
                        </main>

                        <footer className="footer">
                            <span>Powered by Ensight</span>
                        </footer>
                    </div>
                </>
        );
}

export default AdminPage;