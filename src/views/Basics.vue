<template>
  <v-row style="margin-bottom: 10px;">
    <v-col cols="12" justify="center" align="center">
      <v-btn variant="outlined" color="warning" @click="saveConfig" :loading="loading" :disabled="stateChange">
        {{ $t('actions.save') }}
      </v-btn>
    </v-col>
  </v-row>
  <v-expansion-panels>
    <v-expansion-panel :title="$t('basic.log.title')">
      <v-expansion-panel-text>
        <v-row>
          <v-col cols="12" sm="6" md="3" lg="2">
            <v-switch v-model="appConfig.log.disabled" color="primary" :label="$t('disable')" hide-details></v-switch>
          </v-col>
          <v-col cols="12" sm="6" md="3" lg="2">
            <v-select
              hide-details
              :label="$t('basic.log.level')"
              :items="levels"
              clearable
              @click:clear="delete appConfig.log.level"
              v-model="appConfig.log.level">
            </v-select>
          </v-col>
          <v-col cols="12" sm="6" md="3" lg="2">
            <v-text-field
              v-model="appConfig.log.output"
              hide-details
              :label="$t('basic.log.output')"
            ></v-text-field>
          </v-col>
          <v-col cols="12" sm="6" md="3" lg="2">
            <v-switch v-model="appConfig.log.timestamp" color="primary" :label="$t('basic.log.timestamp')" hide-details></v-switch>
          </v-col>
        </v-row>
      </v-expansion-panel-text>
    </v-expansion-panel>
    <v-expansion-panel title="NTP">
      <v-expansion-panel-text>
        <v-row>
          <v-col cols="12" sm="6" md="3" lg="2">
            <v-switch v-model="enableNtp" color="primary" :label="$t('enable')" hide-details></v-switch>
          </v-col>
          <v-col cols="12" sm="6" md="3" lg="2" v-if="appConfig.ntp?.enabled">
            <v-text-field
              v-model="appConfig.ntp.server"
              hide-details
              :label="$t('out.addr')"
            ></v-text-field>
          </v-col>
          <v-col cols="12" sm="6" md="3" lg="2" v-if="appConfig.ntp?.enabled">
            <v-text-field
              v-model="appConfig.ntp.server_port"
              hide-details
              type="number"
              clearable
              @click:clear="delete appConfig.ntp?.server_port"
              :label="$t('out.port')"
            ></v-text-field>
          </v-col>
          <v-col cols="12" sm="6" md="3" lg="2" v-if="appConfig.ntp?.enabled">
            <v-text-field
              v-model="ntpInterval"
              hide-details
              :suffix="$t('date.m')"
              min="0"
              type="number"
              :label="$t('ruleset.interval')"
            ></v-text-field>
          </v-col>
        </v-row>
        <Dial :dial="appConfig.ntp" :outTags="outboundTags" v-if="appConfig.ntp?.enabled" />
      </v-expansion-panel-text>
    </v-expansion-panel>
    <v-expansion-panel title="Experimental">
      <v-expansion-panel-text>
        Cache File
        <v-divider></v-divider>
        <v-row>
          <v-col cols="12" sm="6" md="3" lg="2">
            <v-switch v-model="enableCacheFile" color="primary" :label="$t('enable')" hide-details></v-switch>
          </v-col>
          <v-col cols="12" sm="6" md="3" lg="2" v-if="appConfig.experimental.cache_file">
            <v-text-field
              v-model="appConfig.experimental.cache_file.path"
              hide-details
              :label="$t('transport.path')"
            ></v-text-field>
          </v-col>
          <v-col cols="12" sm="6" md="3" lg="2" v-if="appConfig.experimental.cache_file">
            <v-text-field
              v-model="appConfig.experimental.cache_file.cache_id"
              hide-details
              label="Cache ID"
            ></v-text-field>
          </v-col>
          <v-col cols="12" sm="6" md="3" lg="2" v-if="appConfig.experimental.cache_file">
            <v-switch v-model="appConfig.experimental.cache_file.store_fakeip"
              color="primary"
              :label="$t('basic.exp.storeFakeIp')"
              hide-details></v-switch>
          </v-col>
        </v-row>
      </v-expansion-panel-text>
    </v-expansion-panel>
  </v-expansion-panels>
</template>

<script lang="ts" setup>
import Data from '@/store/modules/data'
import Dial from '@/components/Dial.vue'
import { computed, ref, onMounted } from 'vue'
import { Config, Ntp } from '@/types/config'
import { FindDiff } from '@/plugins/utils'

const oldConfig = ref({})
const loading = ref(false)

const appConfig = computed((): Config => {
  return <Config> Data().config
})

onMounted(async () => {
  oldConfig.value = JSON.parse(JSON.stringify(Data().config))
})

const stateChange = computed(() => {
  return FindDiff.deepCompare(appConfig.value,oldConfig.value)
})

const saveConfig = async () => {
  loading.value = true
  const success = await Data().save("config", "set", appConfig.value)
  if (success) {
    oldConfig.value = JSON.parse(JSON.stringify(Data().config))
    loading.value = false
  }
}

const outboundTags = computed((): string[] => {
  return [...Data().outbounds?.map((o:any) => o.tag), ...Data().endpoints?.map((e:any) => e.tag)]
})

const levels = ["trace", "debug", "info", "warn", "error", "fatal", "panic"]

const enableNtp = computed({
  get() { return appConfig.value.ntp?.enabled?? false },
  set(v:boolean) { 
    if (v){
      appConfig.value.ntp = <Ntp>{ enabled: true, server: 'time.apple.com', server_port: 123, interval: '30m'}
    } else { appConfig.value.ntp = <Ntp>{}  }
  }
})

const ntpInterval = computed({
  get():any { return appConfig.value.ntp?.interval? parseInt(appConfig.value.ntp?.interval.replace('m','')) : null },
  set(v:number) { if (appConfig.value.ntp) v>0 ? appConfig.value.ntp.interval =  v + 'm' : delete appConfig.value.ntp.interval }
})

const enableCacheFile = computed({
  get() { return appConfig.value.experimental.cache_file?.enabled?? false },
  set(v:boolean) { 
    if (v){
      appConfig.value.experimental.cache_file = { enabled: true }
    } else { delete appConfig.value.experimental.cache_file  }
  }
})

</script>