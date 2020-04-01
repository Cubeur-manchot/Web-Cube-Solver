"use strict";

function createHtmlTag(tagType) // create simple HTML tag
{
	return document.createElement(tagType);
}

function createHtmlTagWithId(tagType, tagId) // create simple HTML tag and sets its id
{
	let htmlTag = document.createElement(tagType);
	htmlTag.id = tagId;
	return htmlTag;
}

function createHtmlTagWithClassName(tagType, tagClassName) // create simple HTML tag and set its class
{
	let htmlTag = document.createElement(tagType);
	htmlTag.className = tagClassName;
	return htmlTag;
}

function createHtmlTagWithTextContent(tagType, tagTextContent) // create simple HTML tag and set its text content
{
	let htmlTag = document.createElement(tagType);
	htmlTag.textContent = tagTextContent;
	return htmlTag;
}

function createHtmlTagWithIdAndClassName(tagType, tagId, tagClassName) // create simple HTML tag and set its id and class
{
	let htmlTag = document.createElement(tagType);
	htmlTag.id = tagId;
	htmlTag.className = tagClassName;
	return htmlTag;
}

function createHtmlTagWithClassNameAndTextContent(tagType, tagClassName, tagTextContent) // create simple HTML tag and set its class and text content
{
	let htmlTag = document.createElement(tagType);
	htmlTag.className = tagClassName;
	htmlTag.textContent = tagTextContent;
	return htmlTag;
}

function createHtmlTagWithIdClassNameHrefTextContent(tagType, tagId, tagClassName, tagHref, tagTextContent) // create simple HTML tag and set its class, href and text content
{
	let htmlTag = document.createElement(tagType);
	htmlTag.id = tagId;
	htmlTag.className = tagClassName;
	htmlTag.href = tagHref;
	htmlTag.textContent = tagTextContent;
	return htmlTag;
}
