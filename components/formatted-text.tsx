/* eslint-disable @typescript-eslint/ban-ts-comment */
import React from "react";
import PropTypes from "prop-types";
import { marked } from "marked";

const renderer = new marked.Renderer();

// @ts-ignore
renderer.table = (header, body) => {
	return `
    <div class="w-full overflow-x-auto">
      <table>
        <thead>${header}</thead>
        <tbody>${body}</tbody>
      </table>
    </div>
  `;
};

marked.setOptions({
	renderer,
	breaks: true
});

const FormattedText = ({
	text,
	className
}: {
	text: string;
	className?: string;
}) => {
	const htmlContent = marked(text);

	return (
		<div className={`formatted-text text-sm ${className || ""}`}>
			<div
				dangerouslySetInnerHTML={{ __html: htmlContent }}
				className='space-y-5 leading-loose'
			/>
		</div>
	);
};

FormattedText.propTypes = {
	text: PropTypes.string.isRequired,
	className: PropTypes.string
};

export default FormattedText;
