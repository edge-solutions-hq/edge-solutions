import {Children, Fragment, isValidElement} from 'react';
import type {ReactElement, ReactNode} from 'react';

type ElementWithChildren = ReactElement<{children?: ReactNode}>;

function isBlankText(node: ReactNode) {
  return typeof node === 'string' && node.trim() === '';
}

function isParagraphElement(node: ReactNode): node is ElementWithChildren {
  return isValidElement(node) && node.type === 'p';
}

function unwrapNode(node: ReactNode): ReactNode {
  if (!isParagraphElement(node)) {
    return node;
  }

  const childNodes = Children.toArray(node.props.children).filter(
    (child) => !isBlankText(child),
  );

  if (childNodes.length === 1 && isParagraphElement(childNodes[0])) {
    return unwrapNode(childNodes[0]);
  }

  if (childNodes.length > 1 && childNodes.every(isParagraphElement)) {
    return (
      <>
        {childNodes.map((child, index) => (
          <Fragment key={index}>{unwrapNode(child)}</Fragment>
        ))}
      </>
    );
  }

  return node;
}

export function unwrapMdxParagraphs(children: ReactNode) {
  return Children.map(children, unwrapNode);
}
