import React, { useState, useContext, useEffect } from 'react';
import {
	Card,
	ButtonBase,
	IconButton,
	CardContent,
	Typography,
	CardActions,
	Button,
	CardActionArea,
	Tooltip
} from '@material-ui/core';
import './ProductPreview.css';
import { AddIcon, House } from '@material-ui/icons';
import { StylesProvider } from '@material-ui/core/styles';
import ConfirmationDialog from './ConfirmationDialog';
import { getProductsFromApi } from './actions/products';
import { unsubscribeFromProduct } from './actions/currentUser';

import { useSelector, useDispatch } from 'react-redux';

import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles({
	icon   : {
		color : 'dodgerblue'
	},
	button : {
		color : 'PaleVioletRed'
	}
});

/** This component is used for users to view subscribed products on their profile.  Allows user to unsubscribe. */

const ProductDisplay = ({ icon, price, description, title, id }) => {
	const classes = useStyles();
	const token = useSelector((st) => st.token);
	const currentUser = useSelector((st) => st.currentUser);
	const dispatch = useDispatch();
	const [ dialogOpen, setDialogOpen ] = useState(false);

	const handleDialogOpen = () => {
		setDialogOpen(true);
	};

	const handleDialogClose = () => {
		setDialogOpen(false);
	};
	const handleDialogConfirmation = () => {
		setDialogOpen(false);
		console.log('we handled dialog');
		dispatch(unsubscribeFromProduct(currentUser.username, id, token));
	};

	return (
		<div className="ProductPreview ">
			<StylesProvider injectFirst>
				<Tooltip title={description} arrow placement="top">
					<ButtonBase className="w-100" onClick={handleDialogOpen} disableTouchRipple>
						<Card className="w-100">
							<CardContent>
								<IconButton className={classes.icon}>{icon}</IconButton>
								<Typography variant="subtitle1">{title}</Typography>
								<Typography>
									<b>${price}/month</b>
								</Typography>
							</CardContent>

							<CardActionArea>
								<Button className={classes.button} size="small" color="primary">
									unsubscribe
								</Button>
							</CardActionArea>
						</Card>
					</ButtonBase>
				</Tooltip>
				<ConfirmationDialog
					title="You are unsubscribing"
					handleClose={handleDialogClose}
					handleConfirmation={handleDialogConfirmation}
					open={dialogOpen}
					text={`You are unsubscribing from the Subly ${title} service. You will no longer have access to this service`}
				/>
			</StylesProvider>
		</div>
	);
};

export default ProductDisplay;
