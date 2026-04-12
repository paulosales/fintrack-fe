import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Avatar,
  Divider,
  IconButton,
  ListItemText,
  Menu,
  MenuItem,
  Typography,
} from '@mui/material';
import type { AppDispatch, RootState } from '../store';
import { logout } from '../features/auth/authSlice';

const UserMenu: React.FC = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const user = useSelector((state: RootState) => state.auth.user);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  if (!user) return null;

  const initials = user.name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const handleOpen = (event: React.MouseEvent<HTMLElement>) => setAnchorEl(event.currentTarget);

  const handleClose = () => setAnchorEl(null);

  const handleLogout = () => {
    handleClose();
    dispatch(logout());
    navigate('/login', { replace: true });
  };

  return (
    <>
      <IconButton onClick={handleOpen} size="small" aria-label={user.name}>
        <Avatar
          src={user.picture ?? undefined}
          alt={user.name}
          sx={{ width: 32, height: 32, fontSize: '0.875rem' }}
        >
          {!user.picture && initials}
        </Avatar>
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <MenuItem disabled>
          <ListItemText primary={user.name} secondary={user.email} />
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleLogout}>
          <Typography>{t('auth.user.logout')}</Typography>
        </MenuItem>
      </Menu>
    </>
  );
};

export default UserMenu;
