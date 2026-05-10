import {
    IconButton,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Stack
} from "@mui/material";
import DeleteIcon from '@mui/icons-material/Delete';
import ModifyIcon from '@mui/icons-material/Create';
import React, {useState} from "react";
import ModifyFormDialog from "./ModifyFormDialog.jsx";
import DeleteFormDialog from "./DeleteFormDialog.jsx";

export default function ResourcesTable({ rows = [] }) {
    const [modifyOpenDialog, setModifyOpenDialog] = useState(false);
    const [selectedRow, setSelectedRow] = useState(null);
    const [deleteOpenDialog, setDeleteOpenDialog] = useState(false);

    return (
        <TableContainer
            component={Paper}
            sx={{
                width: '100%',
                overflowX: 'auto'
            }}
        >
            <Table
                sx={{ minWidth: 600 }}
                aria-label="resources table"
            >
                <TableHead>
                    <TableRow>
                        <TableCell sx={{ width: '40%' }}>
                            Nom
                        </TableCell>
                        <TableCell sx={{ width: '10%' }}>
                            Type
                        </TableCell>
                        <TableCell
                            align="center"
                            sx={{ width: { xs: '30%', sm: '45%' } }}
                        >
                            Mots-clés
                        </TableCell>
                        <TableCell
                            align="right"
                            sx={{ width: { xs: '20%', sm: '15%' } }}
                        >
                        </TableCell>
                    </TableRow>
                </TableHead>

                <TableBody>
                    {rows.map((row) => (
                        <TableRow key={row.name}>
                            <TableCell>
                                {row.name}
                            </TableCell>

                            <TableCell>
                                {row.type}
                            </TableCell>

                            <TableCell
                                align="center"
                                sx={{
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    maxWidth: { xs: 120, sm: 'none' }
                                }}
                            >
                                {Array.isArray(row.keywords) ? row.keywords.join(", ") : ""}
                            </TableCell>

                            <TableCell align="right">
                                <Stack
                                    direction="row"
                                    spacing={1}
                                    justifyContent="flex-end"
                                >
                                    <IconButton
                                        size="small"
                                        color="primary"
                                        onClick={() => {
                                            setSelectedRow(row);
                                            setModifyOpenDialog(true);
                                        }}
                                    >
                                        <ModifyIcon />
                                    </IconButton>
                                    <IconButton
                                        size="small"
                                        color="error"
                                        onClick={() => {
                                            setSelectedRow(row)
                                            setDeleteOpenDialog(true)
                                        }}
                                    >
                                        <DeleteIcon />
                                    </IconButton>
                                </Stack>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
            <ModifyFormDialog
                open={modifyOpenDialog}
                row={selectedRow}
                onClose={() => {
                    setModifyOpenDialog(false);
                    setSelectedRow(null);
                }}
            />
            <DeleteFormDialog
                open={deleteOpenDialog}
                row={selectedRow}
                onClose={() => {
                    setDeleteOpenDialog(false);
                    setSelectedRow(null);
                }}
            />
        </TableContainer>
    );
}