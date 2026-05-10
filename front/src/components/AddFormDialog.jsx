import * as React from 'react';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Button from '@mui/material/Button';
import axios from "axios";
import {FormControl, InputLabel, MenuItem, Select} from "@mui/material";
import {transformStrToArray} from "../utils/commonFunctions.jsx";

export default function AddFormDialog({ open, onClose }) {
    const [selectedFile, setSelectedFile] = React.useState(null);
    const [documentName, setDocumentName] = React.useState('');
    const [documentType, setDocumentType] = React.useState('')
    const [documentKeywords, setDocumentKeywords] = React.useState('');

    // Action when file is selected
    const handleFileChange = (event) => {
        const file = event.target.files[0];
        setSelectedFile(file);

        // Get file name
        if (file) {
            const nameWithoutExtension = file.name.replace(/\.[^/.]+$/, "");
            setDocumentName(nameWithoutExtension);
        }
    };

    // Add button action
    const handleSubmit = async (event) => {
        event.preventDefault();
        // Put keywords into an array
        const formData = new FormData(event.currentTarget);
        const keywordsArray = transformStrToArray(formData.get("keywords"));

        try {
            // Send resource info to backend
            const resourceInfoInputs = {
                path: `/files/${selectedFile.name}`,
                name: documentName,
                type: documentType,
                keywords: keywordsArray
            }
            console.log(resourceInfoInputs)

            const response = await axios.post(`${import.meta.env.VITE_BACKEND_API_URL}/api/documents/admin/create`, resourceInfoInputs);
            console.log(response)

            // Refresh page
            window.location.reload()
        } catch (error) {
            console.error("Error fetching resources:", error);
        }

        // Close dialog form
        handleClose();
    };

    // Close form dialog
    const handleClose = () => {
        setSelectedFile(null);
        setDocumentName('');
        onClose();
    };

    return (
        <Dialog open={open} onClose={handleClose}>
            <DialogTitle>Ajouter une ressource</DialogTitle>
            <DialogContent>
                <DialogContentText>
                    Sélectionnez un document à ajouter
                </DialogContentText>
                <form onSubmit={handleSubmit} id="resource-form">
                    <input
                        type="file"
                        name="file"
                        onChange={handleFileChange}
                        style={{ marginTop: '16px' }}
                        required
                    />
                    <TextField
                        margin="dense"
                        id="name"
                        name="name"
                        label="Nom du document"
                        type="text"
                        fullWidth
                        variant="standard"
                        required
                        value={documentName}
                        onChange={(e) => setDocumentName(e.target.value)}
                    />
                    <FormControl
                        fullWidth
                        style={{ marginTop: '16px' }}
                    >
                        <InputLabel id="type-select-label">Type du document</InputLabel>
                        <Select
                            labelId="type-select-label"
                            id="type-select"
                            value={documentType}
                            label="Type du document"
                            onChange={(e) => setDocumentType(e.target.value)}
                        >
                            <MenuItem value={"pdf"}>PDF</MenuItem>
                            <MenuItem value={"youtube"}>Vidéo youtube</MenuItem>
                            <MenuItem value={"image"}>Image</MenuItem>
                        </Select>
                    </FormControl>
                    <TextField
                        margin="dense"
                        id="keywords"
                        name="keywords"
                        label="Mots-clés (séparés par des virgules)"
                        type="text"
                        fullWidth
                        variant="standard"
                        value={documentKeywords}
                        onChange={(e) => setDocumentKeywords(e.target.value)}
                        required
                    />
                </form>
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose}>Annuler</Button>
                <Button type="submit" form="resource-form">
                    Ajouter
                </Button>
            </DialogActions>
        </Dialog>
    );
}