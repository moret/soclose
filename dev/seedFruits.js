import request from 'supertest';
import mongooseConnect from '../src/mongooseConnect'
import app from '../src/app';
import { Word, WordToWordDistance } from '../src/models';

const fruits = [
  'Açaí',
  'Acerola',
  'Abacate',
  'Abacaxi',
  'Ameixa',
  'Amêndoa',
  'Amora',
  'Anona',
  'Araticum',
  'Babaço',
  'Banana',
  'Berinjela',
  'Bacuripari',
  'Cajá',
  'Caju',
  'Caqui',
  'Cambuci',
  'Carambola',
  'Cereja',
  'Coco',
  'Cupuaçu',
  'Cacau',
  'Castanha-do-Pará',
  'Damasco',
  'Figo',
  'Framboesa',
  'Goiaba',
  'Graviola',
  'Groselha',
  'Guaraná',
  'Ingá',
  'Jabuticaba',
  'Jaca',
  'Jambo',
  'Jambolão',
  'Laranja',
  'Limão',
  'Melancia',
  'Melão',
  'Manga',
  'Mamão',
  'Maracujá',
  'Marmelo',
  'Mexerica',
  'Mirtilo',
  'Morango',
  'Nectarina',
  'Noni',
  'Pinha',
  'Pequi',
  'Pera',
  'Pêssego',
  'Pitanga',
  'Pitaia',
  'Quiuí',
  'Romã',
  'Sapoti',
  'Tamarindo',
  'Tangerina',
  'Tomate',
  'Umbu',
  'Uva',
  'Uva-verde',
];

async function seed() {
  await mongooseConnect();

  await Word.remove({});
  await WordToWordDistance.remove({});

  await Promise.all(fruits.map(async fruit => {
    await request(app).put(`/words/${fruit}`);
  }));

  process.exit(0);
}

seed();
