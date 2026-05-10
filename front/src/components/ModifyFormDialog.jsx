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
import {transformStrToArray, areArraysIdentical} from '../utils/commonFunctions.jsx';

export default function ModifyFormDialog({ open, onClose, row }) {
    const [name, setName] = React.useState('');
    const [type, setType] = React.useState('');
    const [keywords, setKeywords] = React.useState('');
    const [newName, setNewName] = React.useState('');
    const [newType, setNewType] = React.useState('');
    const [newKeywords, setNewKeywords] = React.useState('');

    // Actions when form dialog opened
    React.useEffect(() => {
        if (row) {
            setName(row.name);
            setType(row.type);
            setKeywords(row.keywords);
            setNewName(row.name);
            setNewType(row.type);
            setNewKeywords(row.keywords);
        }
    }, [row]);

    // Modification confirmed
    const handleSubmit = async (event) => {
        event.preventDefault();
        const newKeywordsArray = typeof newKeywords === "string" ? transformStrToArray(newKeywords) : newKeywords;

        // Check that an info has been modified
        if (newName !== name || newType !== type || !areArraysIdentical(newKeywordsArray, keywords)) {
            try {
                const resourceInfoInputs = {
                    id: row.id,
                    name: newName,
                    type: newType,
                    keywords: newKeywordsArray
                }

                // Give resource's new info to backend
                const response = await axios.post(`${import.meta.env.VITE_BACKEND_API_URL}/api/documents/admin/update`, resourceInfoInputs);

                // Refresh page to display modifications
                window.location.reload()
            } catch (error) {
                console.error("Error fetching resources:", error);
            }
        }
        // Close dialog form
        onClose();
    };

    return (
        <Dialog open={open} onClose={onClose}>
            <DialogTitle>Modifier la ressource</DialogTitle>
            <DialogContent>
                <DialogContentText>
                    Modifier les informations de la ressource
                </DialogContentText>
                <form onSubmit={handleSubmit} id="modify-resource-form">
                    <TextField
                        margin="dense"
                        label="Nom du document"
                        fullWidth
                        variant="standard"
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        required
                    />
                    <FormControl
                        fullWidth
                        style={{ marginTop: '16px' }}
                    >
                        <InputLabel id="type-select-label">Type du document</InputLabel>
                        <Select
                            labelId="type-select-label"
                            id="type-select"
                            value={newType}
                            label="Type du document"
                            onChange={(e) => setNewType(e.target.value)}
                        >
                            <MenuItem value={"pdf"}>PDF</MenuItem>
                            <MenuItem value={"youtube"}>Vidéo youtube</MenuItem>
                            <MenuItem value={"image"}>Image</MenuItem>
                        </Select>
                    </FormControl>
                    <TextField
                        margin="dense"
                        label="Mots-clés"
                        fullWidth
                        variant="standard"
                        value={newKeywords}
                        onChange={(e) => setNewKeywords(e.target.value)}
                        required
                    />
                </form>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Annuler</Button>
                <Button type="submit" form="modify-resource-form">
                    Modifier
                </Button>
            </DialogActions>
        </Dialog>
    );
}