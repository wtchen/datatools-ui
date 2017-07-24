import toLower from 'lodash/tolower'
import upperFirst from 'lodash/upperfirst'

export default function toSentenceCase (s) {
  return upperFirst(toLower(s))
}
