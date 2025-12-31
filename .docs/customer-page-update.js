import { useNavigate } from 'react-router-dom';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import EditIcon from '@mui/icons-material/Edit';
import Iconify from '../../ui-component/iconify';
import TableStyle from '../../ui-component/TableStyle';
import { useState, useEffect, useMemo } from 'react';
import { Stack, Button, Container, Typography, Box, Card, Popover, TextField, InputAdornment } from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import DeleteIcon from '@mui/icons-material/Delete';
import * as React from 'react';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import MenuItem from '@mui/material/MenuItem';
import IconButton from '@mui/material/IconButton';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import { getApi } from 'views/services/api';
import DeleteCustomer from './DeleteCustomer';
import AddCustomer from './AddCustomer.js';
import EditCustomer from './EditCustomer';
import { useTranslation } from 'react-i18next';

const Customer = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();

    const [openAdd, setOpenAdd] = useState(false);
    const [openEdit, setOpenEdit] = useState(false);
    const [openDelete, setOpenDelete] = useState(false);

    const [customerData, setCustomerData] = useState([]);
    const [anchorEl, setAnchorEl] = React.useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    const hotel = JSON.parse(localStorage.getItem('hotelData'));

    const [rowData, setRowData] = useState();

    const handleClick = (event, row) => {
        setAnchorEl(event.currentTarget);
        setRowData(row);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const open = Boolean(anchorEl);

    // Fetch customer data from API
    const fetchCustomerData = async () => {
        try {
            const response = await getApi(`api/customer/viewallcustomer/${hotel?.hotelId}`);
            setCustomerData(response?.data?.customerData || []);
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        fetchCustomerData();
    }, [openAdd, openEdit, openDelete]);

    const handleOpenAdd = () => setOpenAdd(true);
    const handleCloseAdd = () => setOpenAdd(false);

    const handleOpenEditCustomer = () => setOpenEdit(true);
    const handleCloseEditCustomer = () => {
        setOpenEdit(false);
        handleClose();
    };

    const handleOpenDeleteCustomer = () => setOpenDelete(true);
    const handleCloseDeleteCustomer = () => {
        setOpenDelete(false);
        handleClose();
    };

    const handleOpenView = () => {
        navigate(`/dashboard/customer/view/${rowData?.phoneNumber}`);
    };

    // Search Logic
    const filteredRows = useMemo(() => {
        const q = searchTerm.trim().toLowerCase();
        if (!q) return customerData;

        return customerData.filter((row) => {
            const name = (row.fullName || '').toLowerCase();
            const phone = (row.phoneNumber || '').toLowerCase();

            return (
                name.includes(q) ||
                phone.includes(q)
            );
        });
    }, [customerData, searchTerm]);

    const columns = [
        {
            field: `fullName`,
            headerName: t('name'),
            flex: 1,
            cellClassName: 'name-column--cell name-column--cell--capitalize',
            renderCell: (params) => (
                <Box>
                    <Box onClick={() => navigate(`/dashboard/customer/view/${params.row.phoneNumber}`)} sx={{ cursor: 'pointer', fontWeight: 600, color: '#2196f3' }}>
                        {params.value}
                    </Box>
                    <div style={{ marginTop: '4px', fontSize: '12px', color: '#777' }}>{params.row.phoneNumber}</div>
                </Box>
            )
        },
        {
            field: 'idFile',
            headerName: t('idProof'),
            flex: 1,
            renderCell: (params) => (
                <Box>
                    {params.row.idFile ? (
                        <a
                            href={`${process.env.REACT_APP_API_URL}/${params.row.idFile}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ color: '#2196f3', textDecoration: 'none', fontWeight: 500 }}
                        >
                            View ID Proof
                        </a>
                    ) : (
                        <span style={{ color: '#999' }}>N/A</span>
                    )}
                </Box>
            )
        },
        {
            field: 'action',
            headerName: t('action'),
            flex: 1,
            renderCell: (params) => (
                <>
                    <div>
                        <IconButton onClick={(event) => handleClick(event, params?.row)}>
                            <MoreVertIcon />
                        </IconButton>
                        <Popover
                            id={params?.row._id}
                            open={open}
                            anchorEl={anchorEl}
                            onClose={handleClose}
                            anchorOrigin={{
                                vertical: 'bottom',
                                horizontal: 'left'
                            }}
                        >
                            <MenuItem onClick={handleOpenEditCustomer} disableRipple>
                                <EditIcon style={{ marginRight: '8px' }} />
                                {t('edit')}
                            </MenuItem>
                            <MenuItem onClick={handleOpenView} disableRipple>
                                <VisibilityIcon style={{ marginRight: '8px', color: 'green' }} />
                                {t('view')}
                            </MenuItem>
                            <MenuItem onClick={handleOpenDeleteCustomer} sx={{ color: 'red' }} disableRipple>
                                <DeleteIcon style={{ marginRight: '8px', color: 'red' }} />
                                {t('delete')}
                            </MenuItem>
                        </Popover>
                    </div>
                </>
            )
        }
    ];

    return (
        <>
            <AddCustomer open={openAdd} handleClose={handleCloseAdd} />
            <DeleteCustomer open={openDelete} handleClose={handleCloseDeleteCustomer} id={rowData?.phoneNumber} />
            <EditCustomer open={openEdit} handleClose={handleCloseEditCustomer} data={rowData} />

            <Container maxWidth={false} sx={{ mt: 2, px: '27px' }}>
                {/* Header Row */}
                <Box
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        flexWrap: 'wrap',
                        gap: 2,
                        mb: 1.5
                    }}
                >
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                        {t('customerManagement')} ({customerData?.length || 0})
                    </Typography>

                    <Box
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 2
                        }}
                    >
                        <TextField
                            placeholder={t('search')}
                            size="small"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            sx={{
                                width: 180,
                                height: 36,
                                borderRadius: '6px',
                                backgroundColor: '#FFFFFF',
                                '& .MuiOutlinedInput-root': {
                                    height: 36,
                                    display: 'flex',
                                    alignItems: 'center',
                                    borderRadius: '6px',
                                    border: '1px solid #BDC1CA',
                                    padding: '0 8px',
                                    backgroundColor: '#FFFFFF',
                                    '& fieldset': { border: 'none' }
                                },
                                '& .MuiOutlinedInput-root input': {
                                    backgroundColor: 'transparent',
                                    borderRadius: 0,
                                    padding: 0,
                                    fontSize: 14,
                                    fontWeight: 400,
                                    color: '#000',
                                    position: 'relative',
                                    top: 1
                                }
                            }}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start" sx={{ mr: 0.5 }}>
                                        <SearchIcon sx={{ fontSize: 16, color: '#000' }} />
                                    </InputAdornment>
                                )
                            }}
                        />

                        <AddIcon
                            onClick={handleOpenAdd}
                            sx={{
                                fontSize: 40,
                                cursor: 'pointer',
                                color: '#8f5aff'
                            }}
                        />
                    </Box>
                </Box>

                {/* Table Grid */}
                <Box
                    sx={{
                        backgroundColor: '#fff',
                        borderRadius: '6px',
                        border: '1.5px solid #CBD5E1',
                        overflow: 'hidden'
                    }}
                >
                    <TableStyle>
                        <Box width="100%">
                            {customerData && (
                                <DataGrid
                                    autoHeight
                                    rows={filteredRows}
                                    columns={columns}
                                    checkboxSelection
                                    getRowId={(row) => row?._id}
                                    pageSizeOptions={[10, 25, 50, 100]}
                                    initialState={{
                                        pagination: { paginationModel: { pageSize: 100, page: 0 } }
                                    }}
                                    disableRowSelectionOnClick
                                    sx={{
                                        border: 'none',
                                        backgroundColor: '#fff',
                                        '& .MuiDataGrid-columnHeaders': {
                                            backgroundColor: '#F9FAFB',
                                            borderBottom: '1px solid #CBD5E1'
                                        },
                                        '& .MuiDataGrid-columnHeader': {
                                            borderRight: '1px solid #CBD5E1',
                                            justifyContent: 'flex-start'
                                        },
                                        '& .MuiDataGrid-columnHeaderTitle': {
                                            fontWeight: 500,
                                            fontSize: 13,
                                            color: '#4B5563'
                                        },
                                        '& .MuiDataGrid-cell': {
                                            fontSize: 13,
                                            color: '#111827',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'flex-start',
                                            borderRight: '1px solid #CBD5E1',
                                            borderBottom: '1px solid #CBD5E1',
                                            backgroundColor: '#fff'
                                        },
                                        '& .MuiDataGrid-row .MuiDataGrid-cell:last-of-type': {
                                            borderRight: 'none'
                                        },
                                        '& .MuiDataGrid-footerContainer': {
                                            borderTop: '1px solid #CBD5E1',
                                            backgroundColor: '#fff'
                                        }
                                    }}
                                />
                            )}
                        </Box>
                    </TableStyle>
                </Box>
            </Container>
        </>
    );
};

export default Customer;
