import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema, Types } from 'mongoose';

export type PublicacionDocument = Publicacion & Document;

const ComentarioSchema = new MongooseSchema(
  {
    usuario: {
      _id: { type: Types.ObjectId },
      nombreUsuario: { type: String, required: true },
      imagenPerfil: { type: String, default: '' },
    },
    texto: { type: String, required: true },
    modificado: { type: Boolean, default: false },
  },
  { _id: true, timestamps: true },
);

@Schema({ timestamps: true })
export class Publicacion {
  @Prop({ type: Types.ObjectId, ref: 'Usuario', required: true })
  usuario!: Types.ObjectId;

  @Prop({ required: true, trim: true })
  texto!: string;

  @Prop({ default: '' })
  imagen?: string;

  @Prop({ type: [Types.ObjectId], ref: 'Usuario', default: [] })
  meGustas!: Types.ObjectId[];

  @Prop({ type: [ComentarioSchema], default: [] })
  comentarios!: any[];

  @Prop({ default: true })
  activo!: boolean;
}

export const PublicacionSchema = SchemaFactory.createForClass(Publicacion);
