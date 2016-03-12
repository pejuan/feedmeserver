                                                              Table "public.orden"
     Column     |            Type             |                        Modifiers                         | Storage  | Stats target | Description 
----------------+-----------------------------+----------------------------------------------------------+----------+--------------+-------------
 id_orden       | integer                     | not null default nextval('orden_id_orden_seq'::regclass) | plain    |              | 
 id_restaurante | character varying(30)       |                                                          | extended |              | 
 estado         | character(1)                | not null                                                 | extended |              | 
 ispaid         | boolean                     |                                                          | plain    |              | 
 tiempo         | timestamp without time zone | default now()                                            | plain    |              | 
 id_cliente     | character varying(50)       |                                                          | extended |              | 
Indexes:
    "orden_pkey" PRIMARY KEY, btree (id_orden)
Foreign-key constraints:
    "orden_id_cliente_fkey" FOREIGN KEY (id_cliente) REFERENCES cliente(correo)
    "orden_id_restaurante_fkey" FOREIGN KEY (id_restaurante) REFERENCES restaurante(id_usuario)
Referenced by:
    TABLE "comida_pertenece_orden" CONSTRAINT "comida_pertenece_orden_id_orden_fkey" FOREIGN KEY (id_orden) REFERENCES orden(id_orden)
Has OIDs: no

