import React, { useState, useEffect } from 'react';
import { Fab, SwipeableDrawer, Button, Divider, Typography, Chip } from '@material-ui/core';
import { Add, House } from '@material-ui/icons';
import styled from 'styled-components';
import ProductPreview from './ProductPreview';
import ProductDisplay from './ProductDisplay';
import { useSelector, useDispatch } from 'react-redux';
import { getProductsFromApi } from './actions/products';
import 'fontsource-roboto';

import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles({
	data : {
		color       : 'black',
		borderColor : 'black',
		border      : '1.5px solid'
	}
});

/** This Component houses the core of the user profile.
 * It contains a drawer that displays available services to which the user has yet to subscribe
 * User can subscribe to any service via selection. 
 */

const Profile = () => {
	const classes = useStyles();
	const dispatch = useDispatch();
	const products = useSelector((st) => st.products);
	const token = useSelector((st) => st.token);
	const currentUser = useSelector((st) => st.currentUser);

	const userSubs = currentUser.subscriptions
		? products.filter((p) => {
				return currentUser.subscriptions.includes(p.id);
			})
		: [];

	const filteredSubs = products.filter((p) => {
		return currentUser.subscriptions ? !currentUser.subscriptions.includes(p.id) : p;
	});

	const monthlyCost = userSubs.reduce((total, current) => {
		return total + current.price;
	}, 0);

	useEffect(() => {
		dispatch(getProductsFromApi(token));
	}, []);

	const StyledFab = styled(Fab)`

    && {background-color: dodgerblue;
    color: white;
    &:hover {
	    background-color: palevioletred;
	    color: black;
	}
}`;

	const [ drawerOpen, setDrawerOpen ] = useState(false);
	const toggleDrawer = (open) => (event) => {
		if (event && event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
			return;
		}

		setDrawerOpen(open);
	};

	return (
		<div className="container">
			<div className="row">
				<div className="col-2 d-flex flex-column align-items-center mb-5 ">
					<StyledFab color="" size="large" className="mt-5" aria-label="add " onClick={toggleDrawer(true)}>
						<Add />
					</StyledFab>

					<div className="mt-2">
						<b>Add a service</b>
					</div>
				</div>
				<div className="col-8 d-flex flex-column align-items-center justify-content-center">
					<Typography variant="h3"> Your Subscriptions</Typography>
				</div>
				<div className="col-2  d-flex flex-column  justify-content-center">
					<Typography variant="h6">
						<b>Total Subs: </b>
						<Chip className={classes.data} variant="outlined" label={userSubs.length} />
					</Typography>
					<Typography variant="h6">
						<b>Total Cost: </b>
						<Chip variant="outlined" className={classes.data} label={`$${monthlyCost}`} />
					</Typography>
				</div>
			</div>
			<div className="row justify-content-center">
				<div className="col-8 ">
					<div className="row">
						{userSubs.map((p) => {
							return (
								<div className="col-3 d-flex justify-content-center mb-4 " key={p.id}>
									<ProductDisplay
										price={p.price}
										title={p.title}
										description={p.description}
										icon={<House />}
										className="mt-5"
										key={p.id}
										id={p.id}
									/>
								</div>
							);
						})}
					</div>
				</div>
			</div>

			<SwipeableDrawer
				anchor="bottom"
				open={drawerOpen}
				onClose={toggleDrawer(false)}
				onOpen={toggleDrawer(true)}
			>
				<div className="container pt-5 pb-5">
					<div className="col d-flex mb-3">
						<Typography variant="h4"> Available Services:</Typography>
					</div>
					<div className="row">
						{filteredSubs.map((p) => {
							return (
								<div className="col-2 d-flex justify-content-center mb-4 " key={p.id}>
									<ProductPreview
										price={p.price}
										title={p.title}
										description={p.description}
										icon={<House />}
										className="mt-5"
										key={p.id}
										id={p.id}
										toggleDrawer={toggleDrawer}
									/>
								</div>
							);
						})}
					</div>
				</div>
			</SwipeableDrawer>
		</div>
	);
};

export default Profile;
