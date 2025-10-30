import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface FilaArrastrableProps {
  id: number;
  children: React.ReactNode;
}

export const FilaArrastrable: React.FC<FilaArrastrableProps> = ({ id, children }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  // Convertir children a array
  const childrenArray = React.Children.toArray(children);

  return (
    <tr ref={setNodeRef} style={style} {...attributes}>
      {childrenArray.map((child, index) => {
        // Solo la primera celda tendrá el drag handler
        if (index === 0 && React.isValidElement(child)) {
          const childProps = child.props as Record<string, unknown>;
          const existingStyle = (typeof childProps.style === 'object' && childProps.style !== null) ? childProps.style as React.CSSProperties : {};
          const newProps = {
            ...childProps,
            ...listeners,
            style: { cursor: 'grab' as const, ...existingStyle }
          };
          return React.cloneElement(child, newProps as Partial<unknown>);
        }
        return child;
      })}
    </tr>
  );
};
