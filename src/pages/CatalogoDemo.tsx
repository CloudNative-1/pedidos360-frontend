// src/pages/CatalogoDemo.tsx
//
// Mini catálogo PÚBLICO de prueba: muestra los elementos ilustrados del
// proyecto (los animales) como si fueran productos, sin depender del backend.
import { Link } from 'react-router-dom';

import img01 from '../imagenes/animales/Imagen de ChatGPT 29 sept 2026, 11_25_45.png';
import img02 from '../imagenes/animales/Imagen de ChatGPT 29 sept 2026, 11_47_53.png';
import img03 from '../imagenes/animales/Imagen de ChatGPT 29 sept 2026, 13_03_05.png';
import img04 from '../imagenes/animales/Imagen de ChatGPT 29 sept 2026, 13_03_07.png';
import img05 from '../imagenes/animales/Imagen de ChatGPT 29 sept 2026, 13_03_11.png';
import img06 from '../imagenes/animales/Imagen de ChatGPT 29 sept 2026, 13_03_18.png';
import img07 from '../imagenes/animales/Imagen de ChatGPT 29 sept 2026, 13_03_20.png';
import img08 from '../imagenes/animales/Imagen de ChatGPT 29 sept 2026, 13_03_42.png';
import img09 from '../imagenes/animales/Imagen de ChatGPT 29 sept 2026, 13_03_53.png';
import img10 from '../imagenes/animales/Imagen de ChatGPT 29 sept 2026, 13_03_57.png';
import img11 from '../imagenes/animales/Imagen de ChatGPT 29 sept 2026, 13_04_00.png';
import img12 from '../imagenes/animales/Imagen de ChatGPT 29 sept 2026, 13_04_04.png';
import img13 from '../imagenes/animales/Imagen de ChatGPT 29 sept 2026, 13_08_06.png';
import img14 from '../imagenes/animales/Imagen de ChatGPT 29 sept 2026, 13_08_15.png';
import img15 from '../imagenes/animales/Imagen de ChatGPT 29 sept 2026, 13_08_18.png';
import img16 from '../imagenes/animales/Imagen de ChatGPT 29 sept 2026, 13_08_22.png';
import img17 from '../imagenes/animales/Imagen de ChatGPT 29 sept 2026, 13_08_24.png';
import img18 from '../imagenes/animales/Imagen de ChatGPT 29 sept 2026, 13_13_25.png';
import img19 from '../imagenes/animales/Imagen de ChatGPT 29 sept 2026, 13_17_52.png';

interface ProductoDemo {
  id: string;
  nombre: string;
  descripcion: string;
  precio: number;
  imagen: string;
}

const EDICION = 'Dorada';

const productos: ProductoDemo[] = [
  { id: 'p01', nombre: 'Miel', descripcion: 'Figurita de colección de la edición Dorada.', precio: 10990, imagen: img01 },
  { id: 'p02', nombre: 'Canela', descripcion: 'Figurita de colección de la edición Dorada.', precio: 11990, imagen: img02 },
  { id: 'p03', nombre: 'Rosa', descripcion: 'Figurita de colección de la edición Dorada.', precio: 9990, imagen: img03 },
  { id: 'p04', nombre: 'Crema', descripcion: 'Figurita de colección de la edición Dorada.', precio: 11490, imagen: img04 },
  { id: 'p05', nombre: 'Caramelo', descripcion: 'Figurita de colección de la edición Dorada.', precio: 10990, imagen: img05 },
  { id: 'p06', nombre: 'Tostado', descripcion: 'Figurita de colección de la edición Dorada.', precio: 11990, imagen: img06 },
  { id: 'p07', nombre: 'Bombón', descripcion: 'Figurita de colección de la edición Dorada.', precio: 12990, imagen: img07 },
  { id: 'p08', nombre: 'Avellana', descripcion: 'Figurita de colección de la edición Dorada.', precio: 10990, imagen: img08 },
  { id: 'p09', nombre: 'Gengibre', descripcion: 'Figurita de colección de la edición Dorada.', precio: 11990, imagen: img09 },
  { id: 'p10', nombre: 'Durazno', descripcion: 'Figurita de colección de la edición Dorada.', precio: 9990, imagen: img10 },
  { id: 'p11', nombre: 'Almendra', descripcion: 'Figurita de colección de la edición Dorada.', precio: 10990, imagen: img11 },
  { id: 'p12', nombre: 'Nieve', descripcion: 'Figurita de colección de la edición Dorada.', precio: 12490, imagen: img12 },
  { id: 'p13', nombre: 'Cacao', descripcion: 'Figurita de colección de la edición Dorada.', precio: 11990, imagen: img13 },
  { id: 'p14', nombre: 'Ámbar', descripcion: 'Figurita de colección de la edición Dorada.', precio: 10990, imagen: img14 },
  { id: 'p15', nombre: 'Cobre', descripcion: 'Figurita de colección de la edición Dorada.', precio: 13990, imagen: img15 },
  { id: 'p16', nombre: 'Ocre', descripcion: 'Figurita de colección de la edición Dorada.', precio: 10990, imagen: img16 },
  { id: 'p17', nombre: 'Café', descripcion: 'Figurita de colección de la edición Dorada.', precio: 11490, imagen: img17 },
  { id: 'p18', nombre: 'Rubí', descripcion: 'Figurita de colección de la edición Dorada.', precio: 13990, imagen: img18 },
  { id: 'p19', nombre: 'Moka', descripcion: 'Figurita de colección de la edición Dorada.', precio: 11990, imagen: img19 },
];

const formatter = new Intl.NumberFormat('es-CL', {
  style: 'currency',
  currency: 'CLP',
  maximumFractionDigits: 0,
});

export function CatalogoDemo() {
  return (
    <main className="catalogo-demo-screen">
      <header className="catalogo-demo-topbar">
        <span className="catalogo-demo-brand">🛍️ Pedidos360 · Mini catálogo</span>
        <Link className="demo-back" to="/">← Volver al inicio</Link>
      </header>
      <div className="catalogo-demo-layout">
        <div className="catalogo-demo-header">
          <p className="card-overline">Edición {EDICION}</p>
          <h1>Mini catálogo de prueba</h1>
          <p>{productos.length} elementos ilustrados del proyecto, mostrados como productos (demo sin backend).</p>
        </div>
        <div className="product-grid">
          {productos.map((producto) => (
            <article className="product-card" key={producto.id}>
              <div className="product-media">
                <img src={producto.imagen} alt={producto.nombre} />
              </div>
              <div className="product-card-heading">
                <div>
                  <p className="card-overline">Colección</p>
                  <h2>{producto.nombre}</h2>
                </div>
                <span className="stock-badge">En stock</span>
              </div>
              <p className="product-description">{producto.descripcion}</p>
              <div className="product-card-footer">
                <strong className="product-price">{formatter.format(producto.precio)}</strong>
              </div>
            </article>
          ))}
        </div>
      </div>
    </main>
  );
}