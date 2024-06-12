import React, { Fragment, useEffect, useState } from "react";
import { useEnvironment, useServer } from "../../contexts";
import { Tree } from "../../components/draggable-tree/tree";
import { navigate } from "@reach/router";
import { ToggleButton, ToggleButtonGroup } from "@material-ui/lab";
import ListIcon from "@material-ui/icons/List";
import AccountTreeIcon from "@material-ui/icons/AccountTree";

export const ResourceTreeView = () => {
	if (!localStorage.getItem("zmt-token")) navigate("/");

	const tab = "tree";
	const { loadResources, rescContext } = useServer();
	const { deviceType } = useEnvironment();
	const [childrenMap, setChildrenMap] = useState();
	const [dataMap, setDataMap] = useState();

	// load all resources to render the hierachy
	useEffect(() => {
		loadResources(0, 0, "", "asc", "RESC_NAME");
	}, [loadResources]);

	useEffect(() => {
		if (
			rescContext &&
			rescContext.total !== 0 &&
			rescContext.total === rescContext.count
		) {
			let childrenMap = new Map();
			let dataMap = new Map();
			let tempZoneData = ["tempZone"];
			for (let i = 0; i < 11; i++) {
				tempZoneData.push("");
			}
			dataMap.set("", tempZoneData);

			rescContext.rows.forEach((resc) => {
				dataMap.set(resc[11], resc);
				if (!childrenMap.has(resc[10])) {
					childrenMap.set(resc[10], []);
				}
				let childrens = childrenMap.get(resc[10]);
				childrens.push(resc);
				childrenMap.set(resc[10], childrens);
			});
			setChildrenMap(childrenMap);
			setDataMap(dataMap);
		}
	}, [rescContext]);

	return (
		<Fragment>
			<ToggleButtonGroup size="small" value={tab}>
				<ToggleButton
					value="list"
					aria-label="list"
					onClick={() => navigate("/resources")}
				>
					<ListIcon />
				</ToggleButton>
				<ToggleButton
					value="tree"
					aria-label="tree"
					onClick={() => navigate("/resources/tree")}
				>
					<AccountTreeIcon />
				</ToggleButton>
			</ToggleButtonGroup>
			{deviceType === "Desktop" ? (
				<Fragment>
					{dataMap !== undefined && (
						<Tree dataMap={dataMap} childrenMap={childrenMap} />
					)}{" "}
				</Fragment>
			) : (
				<p>
					Resource Treeview is not currently available on mobile
					device. Please use your desktop device to visit treeview.
				</p>
			)}
		</Fragment>
	);
};
