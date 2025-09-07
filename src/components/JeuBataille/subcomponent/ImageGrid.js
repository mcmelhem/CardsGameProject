import React from "react";
import { motion, AnimatePresence } from 'framer-motion';
import "../../assets/ImageGrid.css";

const ImageGrid = ({ images }) => {
  return (
    <div className="image-grid">
      <AnimatePresence>
        {images.map((image, index) => (getValue(image) > 0 &&
          (<motion.img
            key={index}
            src={image.image}
            alt={image.code}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid-item"
          ></motion.img>)
        ))}
      </AnimatePresence>
    </div>
  );
};

export default ImageGrid;