const mongoose = require('mongoose');
require('dotenv').config();

const User = require('../models/User');
const Objection = require('../models/Objection');

// Objeciones predefinidas del sistema
const systemObjections = [
  {
    title: "Es demasiado caro",
    description: "El prospecto considera que el precio es muy alto comparado con su presupuesto o expectativas.",
    category: "precio",
    difficulty: "media",
    frequency: "muy frecuente",
    isPublic: true,
    responses: [
      {
        title: "Enfoque en valor",
        content: "Entiendo su preocupación por el precio. Permítame mostrarle el retorno de inversión que obtendrá. Nuestros clientes típicamente recuperan su inversión en 3-6 meses a través de [beneficios específicos]. ¿Le gustaría ver casos de estudio de empresas similares a la suya?",
        technique: "evidencia",
        effectiveness: 4
      },
      {
        title: "Comparación de costos",
        content: "Tiene razón en considerar el costo. Sin embargo, comparado con el costo de no tener esta solución - como [pérdidas o ineficiencias que resuelve] - el precio representa una fracción de lo que podría estar perdiendo. ¿Cuánto le está costando actualmente no tener una solución como esta?",
        technique: "pregunta",
        effectiveness: 5
      }
    ],
    tags: ["precio", "valor", "roi"]
  },
  {
    title: "No veo la necesidad",
    description: "El prospecto no percibe que tiene un problema que tu solución pueda resolver.",
    category: "necesidad",
    difficulty: "difícil",
    frequency: "frecuente",
    isPublic: true,
    responses: [
      {
        title: "Descubrir dolor oculto",
        content: "Entiendo. ¿Puedo hacerle un par de preguntas? ¿Cómo manejan actualmente [proceso relacionado]? ¿Cuánto tiempo les toma? La mayoría de empresas que pensaban no necesitar nuestra solución descubrieron que estaban perdiendo [X horas/dinero] sin darse cuenta.",
        technique: "pregunta",
        effectiveness: 4
      },
      {
        title: "Educar sobre tendencias",
        content: "Lo comprendo. Muchos de nuestros clientes pensaban lo mismo inicialmente. Sin embargo, el mercado está cambiando rápidamente. [Estadística o tendencia de la industria]. Las empresas que se adelantan obtienen una ventaja competitiva significativa. ¿Le gustaría saber cómo sus competidores están abordando esto?",
        technique: "evidencia",
        effectiveness: 4
      }
    ],
    tags: ["necesidad", "problema", "educación"]
  },
  {
    title: "No tengo tiempo ahora",
    description: "El prospecto está ocupado o no considera esto una prioridad inmediata.",
    category: "tiempo",
    difficulty: "fácil",
    frequency: "muy frecuente",
    isPublic: true,
    responses: [
      {
        title: "Respetar y programar",
        content: "Lo entiendo perfectamente, todos estamos ocupados. Precisamente por eso nuestra solución puede ayudarle a ahorrar [X horas a la semana]. ¿Qué le parece si programamos una breve llamada de 15 minutos la próxima semana? Puedo mostrarle cómo esto realmente le ahorrará tiempo a largo plazo.",
        technique: "empatía",
        effectiveness: 5
      },
      {
        title: "Urgencia suave",
        content: "Lo comprendo. Sin embargo, precisamente el no tener tiempo es uno de los problemas que resolvemos. Cada día que pasa sin optimizar [proceso], está perdiendo [tiempo/dinero]. ¿Podríamos agendar algo breve esta misma semana? No querrá seguir perdiendo estos recursos.",
        technique: "reframe",
        effectiveness: 3
      }
    ],
    tags: ["tiempo", "prioridad", "programación"]
  },
  {
    title: "Ya trabajo con la competencia",
    description: "El prospecto ya tiene un proveedor actual para una solución similar.",
    category: "competencia",
    difficulty: "media",
    frequency: "frecuente",
    isPublic: true,
    responses: [
      {
        title: "Curiosidad genuina",
        content: "Excelente, me alegra que ya estén invirtiendo en este tipo de solución. ¿Qué es lo que más valora de su proveedor actual? ¿Hay algo que desearía que hiciera diferente? Muchos de nuestros clientes mantienen a su proveedor actual y nos usan complementariamente porque ofrecemos [diferenciador único].",
        technique: "pregunta",
        effectiveness: 5
      },
      {
        title: "No buscar reemplazo inmediato",
        content: "Perfecto. No estoy sugiriendo que cambie inmediatamente. Sin embargo, siempre es bueno conocer qué más existe en el mercado. Muchas empresas nos conocen primero y luego, cuando llega el momento de renovar contratos, ya tienen una alternativa evaluada. ¿Le gustaría una demo sin compromiso?",
        technique: "reframe",
        effectiveness: 4
      }
    ],
    tags: ["competencia", "comparación", "diferenciación"]
  },
  {
    title: "No tengo presupuesto",
    description: "El prospecto indica que no hay fondos disponibles o asignados.",
    category: "presupuesto",
    difficulty: "media",
    frequency: "frecuente",
    isPublic: true,
    responses: [
      {
        title: "Explorar presupuesto futuro",
        content: "Entiendo. ¿Cuándo suelen revisar presupuestos para el próximo periodo? Me gustaría asegurarme de que tengan toda la información necesaria para considerar esto en su próxima planificación. ¿Podríamos programar algo para ese momento?",
        technique: "pregunta",
        effectiveness: 4
      },
      {
        title: "Justificar inversión",
        content: "Comprendo la restricción presupuestaria. Sin embargo, nuestra solución típicamente se paga sola. ¿Cuánto están gastando actualmente en [problema que resuelve]? Muchos clientes reasignan ese presupuesto hacia nosotros y obtienen mejores resultados. ¿Le gustaría ver un análisis de costo-beneficio?",
        technique: "evidencia",
        effectiveness: 5
      }
    ],
    tags: ["presupuesto", "finanzas", "roi"]
  },
  {
    title: "Necesito pensarlo / consultarlo",
    description: "El prospecto quiere tiempo o necesita consultar con otros tomadores de decisión.",
    category: "indecisión",
    difficulty: "media",
    frequency: "muy frecuente",
    isPublic: true,
    responses: [
      {
        title: "Descubrir preocupaciones",
        content: "Por supuesto, es una decisión importante. Para ayudarle en su evaluación, ¿hay algo específico que le preocupa o sobre lo que necesita más información? ¿Hay otras personas involucradas en la decisión con las que debería hablar?",
        technique: "pregunta",
        effectiveness: 5
      },
      {
        title: "Facilitar el proceso",
        content: "Entiendo perfectamente. ¿Puedo ayudarle preparando un resumen ejecutivo con toda la información clave? También puedo incluir casos de estudio y referencias. ¿Cuándo sería un buen momento para darle seguimiento y responder cualquier pregunta que surja?",
        technique: "empatía",
        effectiveness: 4
      }
    ],
    tags: ["indecisión", "seguimiento", "stakeholders"]
  },
  {
    title: "Envíame más información",
    description: "El prospecto pide información adicional, a veces como forma de terminar la conversación.",
    category: "otro",
    difficulty: "fácil",
    frequency: "muy frecuente",
    isPublic: true,
    responses: [
      {
        title: "Calificar interés",
        content: "Con gusto. Para enviarte la información más relevante, ¿qué es lo que te gustaría conocer específicamente? ¿Hay algún desafío particular que estés enfrentando? Así puedo personalizar el material para tu situación.",
        technique: "pregunta",
        effectiveness: 5
      },
      {
        title: "Programar seguimiento",
        content: "Perfecto, te enviaré la información. Para asegurarme de que revises lo más importante, ¿qué te parece si programamos una breve llamada de 10 minutos después de que la revises? Así puedo responder cualquier pregunta que tengas. ¿Te viene bien el martes o el jueves?",
        technique: "empatía",
        effectiveness: 4
      }
    ],
    tags: ["información", "seguimiento", "calificación"]
  }
];

async function seedDatabase() {
  try {
    // Conectar a MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/perfectcall_ai');
    console.log('✅ Conectado a MongoDB');

    // Limpiar colecciones existentes (opcional - comentar si no quieres borrar datos)
    console.log('🗑️  Limpiando datos existentes...');
    await Objection.deleteMany({ isPublic: true, userId: null });

    // Insertar objeciones del sistema
    console.log('📝 Insertando objeciones predefinidas...');
    await Objection.insertMany(systemObjections);
    console.log(`✅ ${systemObjections.length} objeciones insertadas`);

    // Crear usuario demo (opcional)
    const existingUser = await User.findOne({ email: 'demo@salestrainer.ai' });
    if (!existingUser) {
      const demoUser = new User({
        name: 'Usuario Demo',
        email: 'demo@salestrainer.ai',
        password: 'demo123456',
        company: 'SalesTrainer Demo',
        role: 'user'
      });
      await demoUser.save();
      console.log('✅ Usuario demo creado:');
      console.log('   Email: demo@salestrainer.ai');
      console.log('   Password: demo123456');
    } else {
      console.log('ℹ️  Usuario demo ya existe');
    }

    console.log('\n🎉 ¡Base de datos inicializada exitosamente!');
    console.log('\nPuedes iniciar sesión con:');
    console.log('Email: demo@salestrainer.ai');
    console.log('Password: demo123456');

  } catch (error) {
    console.error('❌ Error inicializando base de datos:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n👋 Desconectado de MongoDB');
    process.exit(0);
  }
}

// Ejecutar seed
seedDatabase();