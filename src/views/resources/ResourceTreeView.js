import React, { Fragment, useEffect, useState } from "react";
import { useEnvironment, useServer } from "../../contexts";
import { Tree } from "../../components/draggable-tree";
import { Navigate } from "react-router-dom";
import { ToggleButton, ToggleButtonGroup } from "@mui/material";
import { List as ListIcon, AccountTree as AccountTreeIcon } from "@mui/icons-material";

export const ResourceTreeView = () => {
	if (!localStorage.getItem("zmt-token")) Navigate("/");

	const tab = "tree";
	const { loadResources, rescContext } = useServer();
	const { deviceType } = useEnvironment();
	const [childrenMap, setChildrenMap] = useState();
	const [dataMap, setDataMap] = useState();

	// load all resources to render the hierarchy
	useEffect(() => {
		loadResources(0, 0, "", "asc", "RESC_NAME");
	}, [loadResources]);

	useEffect(() => {
		if (
			rescContext &&
			rescContext.total !== 0 &&
			rescContext.total === rescContext.count
		) {
			const childrenMap = new Map();
			const dataMap = new Map();
			const tempZoneData = ["tempZone"];
			for (let i = 0; i < 11; i++) {
				tempZoneData.push("");
			}
			dataMap.set("", tempZoneData);

			rescContext.rows.forEach((resc) => {
				dataMap.set(resc[11], resc);
				if (!childrenMap.has(resc[10])) {
					childrenMap.set(resc[10], []);
				}
				const children = childrenMap.get(resc[10]);
				children.push(resc);
				childrenMap.set(resc[10], children);
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
					onClick={() => Navigate("/resources")}
				>
					<ListIcon />
				</ToggleButton>
				<ToggleButton
					value="tree"
					aria-label="tree"
					onClick={() => Navigate("/resources/tree")}
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
