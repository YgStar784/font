<script setup>
import { ref }
export const getUrl = () => {
    if (!localStorage.getItem('nodeIp')) {
        return ''
    }
    else return 'https://' + localStorage.getItem('nodeIp') + ':' + localStorage.getItem('nodePort') + '/api'
}


</script>