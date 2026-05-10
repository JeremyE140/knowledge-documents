import * as React from 'react';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Button from '@mui/material/Button';
import axios from "axios";

export default function DeleteFormDialog({ open, onClose, row }) {
    // Deletion confirmed
    const handleSubmit = async (event) => {
        event.preventDefault();
        try {
            // Give resource's id to backend
            const idResourceInput = { id: row.id }
            const response = await axios.post(`${import.meta.env.VITE_BACKEND_API_URL}/api/documents/admin/delete`, idResourceInput);

            // Refresh page to display modifications
            window.location.reload()
        } catch (error) {
            console.error("Error fetching resources:", error);
        }
        // Close dialog form
        onClose();
    };

    return (
        <Dialog open={open} onClose={onClose}>
            <DialogTitle>
                Supprimer une ressource
            </DialogTitle>
            <DialogContent>
                <DialogContentText>
                    Confirmez-vous vouloir supprimer la ressource {row && ` '${row.name}'`} ?
                </DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Annuler</Button>
                <Button onClick={handleSubmit} type="submit">
                    Supprimer
                </Button>
            </DialogActions>
        </Dialog>
    );
}