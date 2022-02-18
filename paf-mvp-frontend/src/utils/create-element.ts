export const createElement = (tagName: string, attributes?: { [key: string]: string | number | boolean }) => {
  const element = document.createElement(tagName);
  for (const attrName in attributes) {
    element.setAttribute(attrName, attributes[attrName] as string);
  }

  return element;
};
