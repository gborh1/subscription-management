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
import { subscribeToProduct } from './actions/currentUser';

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

/** This component is used for users to browse product before subscribing.
 * This is a tile of product information 
 */

const ProductPreview = ({ icon, price, description, title, id, toggleDrawer }) => {
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
		toggleDrawer(false)();
		dispatch(subscribeToProduct(currentUser.username, id, token));
	};

	return (
		<div className="ProductPreview ">
			<Tooltip title={description} arrow placement="top">
				<ButtonBase className="w-100" onClick={handleDialogOpen}>
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
								Subscribe
							</Button>
						</CardActionArea>
					</Card>
				</ButtonBase>
			</Tooltip>
			<ConfirmationDialog
				title="Confirm your subscription"
				handleClose={handleDialogClose}
				handleConfirmation={handleDialogConfirmation}
				open={dialogOpen}
				text={`You are subscribing to the Subly ${title} service for $${price} a month.`}
			/>
		</div>
	);
};

export default ProductPreview;
