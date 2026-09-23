import Conversation from "./model/conversation.schema";
import ConversationDocument from "./model/convodoc.schema";
import Message from "./model/message.schema";
import Document from "./model/document.schema";

// Conversation → Messages
Conversation.hasMany(Message, {
  foreignKey: "conversation_id",
  onDelete: "CASCADE",
});

Message.belongsTo(Conversation, {
  foreignKey: "conversation_id",
});

// Conversation ↔ Documents
Conversation.belongsToMany(Document, {
  through: ConversationDocument,
  foreignKey: "conversation_id",
  otherKey: "document_id",
});

Document.belongsToMany(Conversation, {
  through: ConversationDocument,
  foreignKey: "document_id",
  otherKey: "conversation_id",
});

// ConversationDocument → Conversation
ConversationDocument.belongsTo(Conversation, {
  foreignKey: "conversation_id",
});

ConversationDocument.belongsTo(Document, {
  foreignKey: "document_id",
});