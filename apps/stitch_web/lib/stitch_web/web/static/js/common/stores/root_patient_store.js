import ChannelStore from "./channel_store";
import ConversationMessageStore from "./conversation_message_store";
import CurrentPatientStore from "./current_patient_store";
import InboxStore from "./inbox_store";
import NotificationStore from "./notification_store";
import SocketStore from "./socket_store";
import TeamStore from "./team_store";
import PatientsStore from "./patients_store";

class RootPatientStore {
  isPatient = true;
  get apiBasePath() {
    return "/api/v1/patient";
  }

  constructor(props) {
    this.appParams = Object.assign({}, props);
    this.createStores();

    // when loading is done
    $(".html-loading-element").remove();
    this.joinChannels();
  }

  createStores() {
    this.currentPatientStore = new CurrentPatientStore(this);
    this.teamStore = new TeamStore(this);
    this.channelStore = new ChannelStore(this);
    this.notificationStore = new NotificationStore(this);
    this.socketStore = new SocketStore(this);
    this.conversationMessageStore = new ConversationMessageStore(this);
    this.inboxStore = new InboxStore(this);
    this.patientsStore = new PatientsStore(this);
    this.addonStore = {};
    this.uploadStore = {};
    this.billingStore = {};
    this.groupsStore = {};
    this.sidemenuStore = {};
    this.teamFileStore = {};
    // FIXME need usersStore for patient
    this.usersStore = {
      usersById: new Proxy(
        {},
        {
          get: (target, id) => {
            return {
              id: parseInt(id, 10),
              full_name: "Anonymous",
              username: "mr.provider"
            };
          }
        }
      )
    };
  }

  joinChannels() {
    this.channelStore.joinTeamPatientChannel(patient.team.id);
    this.channelStore.joinEventPatientChannel(patient.id);
  }
}

export default RootPatientStore;
