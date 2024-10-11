import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import {
	// Download,
	RefreshCcw,
	ZoomIn,
	ZoomOut,
	Maximize,
	Minimize
} from "lucide-react";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger
} from "@/components/ui/tooltip";

type TreeNode = {
	name: string;
	children?: TreeNode[];
};

interface TidyTreeDiagramProps {
	data: TreeNode;
}

const MindMap = ({ data }: TidyTreeDiagramProps) => {
	const svgRef = useRef<SVGSVGElement | null>(null);
	const containerRef = useRef<HTMLDivElement>(null);
	const [exportUrl, setExportUrl] = useState<string | null>(null);
	const [isFullscreen, setIsFullscreen] = useState(false);
	const { theme } = useTheme();
	const [selectedNode, setSelectedNode] =
		useState<d3.HierarchyPointNode<TreeNode> | null>(null);

	useEffect(() => {
		if (!data || !svgRef.current) return;

		const svg = d3.select(svgRef.current);
		svg.selectAll("*").remove();

		// Calculate the depth of the tree
		const root = d3.hierarchy(data);
		const treeDepth = root.height;

		const width = 2000;
		const heightPerLevel = Math.max(
			100,
			Math.min(200, 800 / (d3.max(root.descendants(), d => d.depth) || 1))
		);
		const height = Math.min((treeDepth + 1) * heightPerLevel, width / (16 / 9)); // Ensure a minimum height and maintain aspect ratio
		const margin = { top: 20, right: 120, bottom: 30, left: 120 };

		const innerWidth = width - margin.left - margin.right;
		const innerHeight = height - margin.top - margin.bottom;

		svg.attr("viewBox", `0 0 ${width} ${height}`);

		const tree = d3
			.tree<TreeNode>()
			.size([innerHeight, innerWidth])
			.separation((a, b) => (a.parent === b.parent ? 1 : 1.2));

		const links = tree(root).links();
		const nodes = root.descendants();

		// Set colors based on theme
		const linkColor = theme === "dark" ? "#555" : "#ccc";
		const nodeColor = theme === "dark" ? "#69b3a2" : "#4a9e82";
		const textColor = theme === "dark" ? "#fff" : "#000";
		const highlightColor = theme === "dark" ? "#ff6b6b" : "#ff4757";

		// Create links
		const g = svg
			.append("g")
			.attr("transform", `translate(${margin.left},${margin.top})`);

		const link = g
			.selectAll(".link")
			.data(links)
			.enter()
			.append("path")
			.attr("class", "link")
			.attr(
				"d",
				d3
					.linkHorizontal<
						d3.HierarchyLink<TreeNode>,
						d3.HierarchyPointNode<TreeNode>
					>()
					.x(d => d.y)
					.y(d => d.x)
			)
			.attr("fill", "none")
			.attr("stroke", linkColor)
			.attr("stroke-width", 1.5);

		// Create nodes
		const node = g
			.selectAll(".node")
			.data(nodes)
			.enter()
			.append("g")
			.attr("class", "node")
			.attr("transform", d => `translate(${d.y},${d.x})`);

		// Add circles to nodes
		node.append("circle").attr("r", 8).attr("fill", nodeColor);

		// Add labels to nodes
		node
			.append("text")
			.attr("dy", ".35em")
			.attr("x", d => (d.children ? -13 : 13))
			.style("text-anchor", d => (d.children ? "end" : "start"))
			.text(d => d.data.name)
			.style("fill", textColor)
			.style("font-size", "12px")
			.style("white-space", "nowrap");

		// Add click event to the entire node group
		node.on("click", (event, d: any) => handleNodeClick(event, d));

		function handleNodeClick(
			event: MouseEvent,
			d: d3.HierarchyPointNode<TreeNode>
		) {
			setSelectedNode(prevSelected => (prevSelected === d ? null : d));

			// Reset all links and nodes to default color
			link.attr("stroke", linkColor).attr("stroke-width", 1.5);
			node.select("circle").attr("fill", nodeColor);

			if (selectedNode !== d) {
				// Highlight the path to the root
				let current: d3.HierarchyPointNode<TreeNode> | null = d;
				while (current.parent) {
					link
						.filter(l => l.target === current)
						.attr("stroke", highlightColor)
						.attr("stroke-width", 4);
					node
						.filter(n => n === current)
						.select("circle")
						.attr("fill", highlightColor);
					current = current.parent;
				}
			}
		}

		// Add zoom and pan functionality
		const zoom = d3
			.zoom<SVGSVGElement, unknown>()
			.scaleExtent([0.1, 4])
			.on("zoom", event => {
				g.attr("transform", event.transform);
			});

		svg.call(zoom);

		// Add zoom controls
		const zoomIn = () => svg.transition().call(zoom.scaleBy, 1.2);
		const zoomOut = () => svg.transition().call(zoom.scaleBy, 0.8);
		const resetZoom = () =>
			svg.transition().call(zoom.transform, d3.zoomIdentity);

		d3.select("#zoom-in").on("click", zoomIn);
		d3.select("#zoom-out").on("click", zoomOut);
		d3.select("#reset-zoom").on("click", resetZoom);

		// Export functionality
		const exportSVG = () => {
			const clone = svg.node()!.cloneNode(true) as SVGSVGElement;
			d3.select(clone).select("g").attr("transform", null);
			const svgData = new XMLSerializer().serializeToString(clone);
			const svgBlob = new Blob([svgData], {
				type: "image/svg+xml;charset=utf-8"
			});
			const url = URL.createObjectURL(svgBlob);
			setExportUrl(url);
		};

		exportSVG();

		return () => {
			if (exportUrl) {
				URL.revokeObjectURL(exportUrl);
			}
		};
	}, [data, theme]);

	// const handleExport = () => {
	// 	if (exportUrl) {
	// 		const link = document.createElement("a");
	// 		link.href = exportUrl;
	// 		link.download = "mind_map.svg";
	// 		document.body.appendChild(link);
	// 		link.click();
	// 		document.body.removeChild(link);
	// 	}
	// };

	const toggleFullscreen = () => {
		if (!document.fullscreenElement) {
			containerRef.current?.requestFullscreen();
			setIsFullscreen(true);
		} else {
			document.exitFullscreen();
			setIsFullscreen(false);
		}
	};

	useEffect(() => {
		const handleFullscreenChange = () => {
			setIsFullscreen(!!document.fullscreenElement);
		};

		document.addEventListener("fullscreenchange", handleFullscreenChange);

		return () => {
			document.removeEventListener("fullscreenchange", handleFullscreenChange);
		};
	}, []);

	return (
		<div
			ref={containerRef}
			className='relative w-full h-full overflow-hidden bg-muted'
		>
			<svg
				ref={svgRef}
				width='100%'
				height='100%'
				className='absolute top-0 left-0 cursor-grab z-20'
			/>
			<div className='absolute w-full bottom-0 left-0 flex space-x-3 items-center justify-end p-2 z-30'>
				<Tooltip>
					<TooltipTrigger asChild>
						<Button id='zoom-in' size='icon' variant='outline'>
							<ZoomIn className='size-4' />
						</Button>
					</TooltipTrigger>
					<TooltipContent side='top' align='center'>
						Zoom In
					</TooltipContent>
				</Tooltip>

				<Tooltip>
					<TooltipTrigger asChild>
						<Button id='zoom-out' size='icon' variant='outline'>
							<ZoomOut className='size-4' />
						</Button>
					</TooltipTrigger>
					<TooltipContent side='top' align='center'>
						Zoom Out
					</TooltipContent>
				</Tooltip>

				<Tooltip>
					<TooltipTrigger asChild>
						<Button id='reset-zoom' size='icon' variant='outline'>
							<RefreshCcw className='size-4' />
						</Button>
					</TooltipTrigger>
					<TooltipContent side='top' align='center'>
						Reset Zoom
					</TooltipContent>
				</Tooltip>

				{/* <Button onClick={handleExport} size='icon' variant='outline'>
					<Download className='size-4' />
				</Button> */}

				<Tooltip>
					<TooltipTrigger asChild>
						<Button onClick={toggleFullscreen} size='icon' variant='outline'>
							{isFullscreen ? (
								<Minimize className='size-4' />
							) : (
								<Maximize className='size-4' />
							)}
						</Button>
					</TooltipTrigger>
					<TooltipContent side='top' align='center'>
						{isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
					</TooltipContent>
				</Tooltip>
			</div>
		</div>
	);
};

export default MindMap;
