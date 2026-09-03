export type Product = {
  id: string;
  name: string;
  shortName: string;
  category: string;
  image: string;
  description: string;
  price: number;
  tag?: string;
  sizes?: string[];
  colors?: string[];
  active?: boolean;
  sortOrder?: number;
};

export const defaultProducts: Product[] = [
  { id:"polera", name:"Polera personalizada", shortName:"Poleras", category:"Textil", image:"/products/polera.png", description:"Algodón suave y estampado de alta definición para regalos, equipos y eventos.", price:10990, tag:"Más vendido", sizes:["XS","S","M","L","XL","XXL"], colors:["Blanco","Negro","Azul marino","Rojo"], active:true, sortOrder:1 },
  { id:"poleron", name:"Polerón personalizado", shortName:"Polerones", category:"Textil", image:"/products/poleron.png", description:"Abrigo cómodo con una terminación resistente y un diseño hecho para ti.", price:24990, sizes:["S","M","L","XL","XXL"], colors:["Negro","Azul marino","Gris","Blanco"], active:true, sortOrder:2 },
  { id:"gorra", name:"Gorra personalizada", shortName:"Gorras", category:"Accesorios", image:"/products/gorra.png", description:"Una gorra ajustable para llevar tu nombre, marca o diseño favorito.", price:8990, colors:["Negro","Azul marino","Blanco","Rojo"], active:true, sortOrder:3 },
  { id:"delantal", name:"Delantal parrillero", shortName:"Delantales", category:"Accesorios", image:"/products/delantal.png", description:"Delantal de mezclilla con bolsillos, ideal para parrilla, cocina y regalos.", price:15990, tag:"Nuevo", colors:["Mezclilla azul","Negro"], active:true, sortOrder:4 },
  { id:"chapitas", name:"Set de chapitas", shortName:"Chapitas", category:"Detalles", image:"/products/chapitas.png", description:"Chapitas personalizadas para celebraciones, campañas y recuerdos.", price:4990, active:true, sortOrder:5 },
  { id:"taza", name:"Taza personalizada", shortName:"Tazas", category:"Tazas y vasos", image:"/products/taza.png", description:"La clásica taza de 11 oz con fotografía, frase o gráfica personalizada.", price:6990, tag:"Favorito", colors:["Blanco","Interior negro","Interior rojo"], active:true, sortOrder:6 },
  { id:"tazon", name:"Tazón personalizado", shortName:"Tazones", category:"Tazas y vasos", image:"/products/tazon.png", description:"Formato de mayor capacidad para disfrutar bebidas calientes con estilo propio.", price:8990, colors:["Blanco","Negro"], active:true, sortOrder:7 },
  { id:"shopero", name:"Shopero personalizado", shortName:"Shoperos", category:"Tazas y vasos", image:"/products/shopero.png", description:"Shopero de vidrio con impresión personalizada para regalar y celebrar.", price:10990, active:true, sortOrder:8 },
  { id:"topper", name:"Topper de torta", shortName:"Toppers", category:"Celebraciones", image:"/products/topper.png", description:"Nombre, edad y temática para darle el toque final a cada celebración.", price:7990, colors:["Dorado","Plateado","Negro","Multicolor"], active:true, sortOrder:9 },
];

export const categories = ["Todos", "Textil", "Accesorios", "Tazas y vasos", "Detalles", "Celebraciones"];
